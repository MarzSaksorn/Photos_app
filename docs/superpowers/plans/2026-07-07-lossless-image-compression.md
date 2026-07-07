# Lossless Image Compression Implementation Plan

**Goal:** Compress uploaded images to lossless WebP before uploading to R2, reducing storage and bandwidth by 25–35% with zero visual quality loss.

**Architecture:** Create `compressImage()` in `src/lib/image-compression.ts` using OffscreenCanvas to decode → re-encode as WebP. Integrate into both upload paths (`use-upload.ts` and `upload/page.tsx`).

**Tech Stack:** OffscreenCanvas API, `createImageBitmap`, `canvas.convertToBlob`

## Global Constraints
- No extra npm dependencies
- Skip RAW/video/animated files
- Fall back to original if WebP unsupported or compressed file is larger
- Content-Type must reflect actual uploaded format

---

### Task 1: Create compression utility

**Files:**
- Create: `src/lib/image-compression.ts`

**Interfaces:**
- Produces: `compressImage(file: File): Promise<{ blob: Blob; mimeType: string }>`

- [ ] **Step 1: Write the file**

`src/lib/image-compression.ts`:

```typescript
const RAW_EXTENSIONS = /\.(cr2|nef|arw|dng|raf|orf|rw2|raw)$/i;
const SUPPORTED_IMAGE = /^image\/(?!gif|svg)/;

export async function compressImage(file: File): Promise<{ blob: Blob; mimeType: string }> {
  if (file.type.startsWith('video/') || RAW_EXTENSIONS.test(file.name) || !SUPPORTED_IMAGE.test(file.type)) {
    return { blob: file, mimeType: file.type };
  }

  if (typeof OffscreenCanvas === 'undefined') {
    return { blob: file, mimeType: file.type };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 1 });

    if (blob.size < file.size) {
      return { blob, mimeType: 'image/webp' };
    }
  } catch {
    // Fall through to return original
  }

  return { blob: file, mimeType: file.type };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/image-compression.ts
git commit -m "feat: add lossless WebP compression utility"
```

---

### Task 2: Integrate into use-upload hook

**Files:**
- Modify: `src/hooks/use-upload.ts`

- [ ] **Step 1: Add import and compression call**

Add import at top:

```typescript
import { compressImage } from '@/lib/image-compression';
```

In the `uploadFile` function, after line 29 (`fileSize: file.size`) and before the XHR PUT, compress the file:

Replace:

```typescript
      // 2. Upload directly to R2
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState((s) => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }));
        }
      };
```

With:

```typescript
      // 2. Compress image losslessly
      const { blob: uploadBlob, mimeType } = await compressImage(file);

      // 3. Upload directly to R2
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState((s) => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }));
        }
      };
```

And update the XHR to use compressed blob + mimeType:

```typescript
        xhr.setRequestHeader('Content-Type', mimeType);
        xhr.send(uploadBlob);
```

Also update the file size sent to presign — use the compressed size. Replace the `body` JSON:

```typescript
      // 1. Get presigned URL (compressed file size)
      const { blob: compressedBlob, mimeType } = await compressImage(file);
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: mimeType,
          fileSize: compressedBlob.size,
        }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');
      const { url, photoId } = await res.json();

      // 2. Upload directly to R2
      const xhr = new XMLHttpRequest();
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-upload.ts
git commit -m "feat: integrate lossless compression into use-upload hook"
```

---

### Task 3: Integrate into bulk upload page

**Files:**
- Modify: `src/app/upload/page.tsx`

- [ ] **Step 1: Add import and compression call**

Add at top:

```typescript
import { compressImage } from '@/lib/image-compression';
```

In the `uploadFile` function, replace the presign fetch + XHR PUT block with compression-integrated version:

Replace lines 90-131:

```typescript
    try {
      // 1. Get presigned URL
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: qf.file.name,
          contentType: qf.file.type || 'application/octet-stream',
          fileSize: qf.file.size,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to get upload URL');
      }

      const { url } = await res.json();

      // 2. Upload to R2 via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.id === qf.id ? { ...f, progress: pct } : f))
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', qf.file.type || 'application/octet-stream');
        xhr.send(qf.file);
      });

      setFiles((prev) =>
        prev.map((f) => (f.id === qf.id ? { ...f, status: 'done' as const, progress: 100 } : f))
      );
    } catch {
```

With:

```typescript
    try {
      // 1. Compress image losslessly
      const { blob: uploadBlob, mimeType } = await compressImage(qf.file);

      // 2. Get presigned URL
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: qf.file.name,
          contentType: mimeType,
          fileSize: uploadBlob.size,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to get upload URL');
      }

      const { url } = await res.json();

      // 3. Upload to R2 via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.id === qf.id ? { ...f, progress: pct } : f))
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', mimeType);
        xhr.send(uploadBlob);
      });

      setFiles((prev) =>
        prev.map((f) => (f.id === qf.id ? { ...f, status: 'done' as const, progress: 100 } : f))
      );
    } catch {
```

- [ ] **Step 2: Commit**

```bash
git add src/app/upload/page.tsx
git commit -m "feat: integrate lossless compression into bulk upload page"
```

---

### Task 4: Final build verification

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: Clean compile, all pages generated

- [ ] **Step 2: Commit plan**

```bash
git add docs/superpowers/plans/2026-07-07-lossless-image-compression.md
git commit -m "chore: add lossless compression implementation plan"
```
