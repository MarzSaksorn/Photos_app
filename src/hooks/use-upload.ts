'use client';

import { useState, useCallback } from 'react';

interface UploadState {
  status: 'idle' | 'uploading' | 'done' | 'error';
  progress: number;
  currentFile: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    currentFile: null,
  });

  const uploadFile = useCallback(async (file: File) => {
    setState({ status: 'uploading', progress: 0, currentFile: file.name });

    try {
      // 1. Get presigned URL (also creates the photo record)
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');
      const { url, photoId } = await res.json();

      // 2. Upload directly to R2
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState((s) => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => resolve();
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // 3. Extract EXIF-like metadata from the file
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const isRaw = /\.(cr2|nef|arw|dng|raf|orf|rw2|raw)$/i.test(file.name);
          fetch('/api/upload/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoId,
              width: img.naturalWidth,
              height: img.naturalHeight,
              takenAt: null,
              isRaw,
            }),
          });
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.src = objectUrl;
      });

      setState({ status: 'done', progress: 100, currentFile: null });
    } catch {
      setState({ status: 'error', progress: 0, currentFile: file.name });
    }
  }, []);

  return { state, uploadFile };
}
