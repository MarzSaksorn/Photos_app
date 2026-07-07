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
