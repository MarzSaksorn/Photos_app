# Lossless Image Compression in Upload Pipeline

## Objective

Compress all uploaded images to lossless WebP before uploading to R2, reducing storage and bandwidth by 25–35% with zero visual quality loss.

## Architecture

### Compression Function

`src/lib/image-compression.ts` — single exported function:

```
compressImage(file: File): Promise<{ blob: Blob; mimeType: string }>
```

### Algorithm

1. Check if file should be skipped (RAW, video, animated) → return original
2. Decode file to `ImageBitmap` via `createImageBitmap(file)`
3. Create `OffscreenCanvas` at original dimensions
4. Draw bitmap onto canvas (strips all EXIF/metadata in one step)
5. Export canvas as `image/webp` via `canvas.convertToBlob({ type: 'image/webp', quality: 1 })`
6. If WebP blob is smaller than original file size → return `{ blob, mimeType: 'image/webp' }`
7. Otherwise → return original file unchanged

### Skip Conditions

| Condition | Reason |
|-----------|--------|
| `file.type.startsWith('video/')` | Videos not supported by canvas |
| RAW extension (CR2, NEF, ARW, DNG, etc.) | `createImageBitmap` can't decode RAW |
| `OffscreenCanvas` not available | Browser doesn't support it |
| WebP blob ≥ original file size | No benefit from conversion |
| Animated images | Canvas captures only first frame |

### Upload Pipeline Integration

Both upload paths call `compressImage` after file selection, before presign URL generation:

**`use-upload.ts`** (single-file FAB upload):
- After `file` is selected, before `fetch('/api/upload/presign', ...)`
- Pass compressed blob to XHR PUT
- Change `Content-Type` header to `image/webp` when converted

**`upload/page.tsx`** (bulk upload page):
- Same pattern in `uploadFile` function
- File size sent to presign endpoint must reflect compressed blob size

### Presign Endpoint Changes

`/api/upload/presign` needs the actual `contentType` and `fileSize` of the compressed file. Both upload paths already pass these as JSON body params — just ensure the compressed values are used.

### Database Changes

`mime_type` column in `photos` table stores the actual uploaded MIME type — `image/webp` when converted. No schema changes needed.

### R2 Storage

No changes. R2 stores whatever blob we PUT. The key is already namespaced by `users/{userId}/{timestamp}-{filename}`.

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/image-compression.ts` | **New** — `compressImage` function |
| `src/hooks/use-upload.ts` | Call `compressImage` before upload |
| `src/app/upload/page.tsx` | Call `compressImage` in `uploadFile` |
