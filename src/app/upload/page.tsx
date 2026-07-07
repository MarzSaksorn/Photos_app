'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProgress } from '@/components/upload-progress';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-compression';

const RAW_EXTENSIONS = '.cr2,.nef,.arw,.dng,.raf,.orf,.rw2,.raw';
const RAW_EXTENSION_LIST = RAW_EXTENSIONS.split(',');

interface QueuedFile {
  id: string;
  file: File;
  thumbnail: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
}

function isRawFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? RAW_EXTENSION_LIST.includes(`.${ext}`) : false;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming).filter((f) => {
      if (f.type.startsWith('image/') || f.type.startsWith('video/')) return true;
      return isRawFile(f.name);
    });

    const queued: QueuedFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      thumbnail: URL.createObjectURL(file),
      progress: 0,
      status: 'queued' as const,
    }));

    setFiles((prev) => [...prev, ...queued]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.thumbnail);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const uploadFile = useCallback(async (qf: QueuedFile): Promise<void> => {
    setFiles((prev) =>
      prev.map((f) => (f.id === qf.id ? { ...f, status: 'uploading' as const, progress: 0 } : f))
    );

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
      setFiles((prev) =>
        prev.map((f) => (f.id === qf.id ? { ...f, status: 'error' as const } : f))
      );
    }
  }, []);

  const startUpload = useCallback(async () => {
    setOverallStatus('uploading');
    for (const qf of files) {
      if (qf.status === 'queued') {
        await uploadFile(qf);
      }
    }
    const hasError = files.some((f) => f.status === 'error');
    setOverallStatus(hasError ? 'error' : 'done');
  }, [files, uploadFile]);

  const overallProgress = files.length > 0
    ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
    : 0;

  const doneCount = files.filter((f) => f.status === 'done').length;
  const allDone = files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-xl font-semibold">Upload Photos</h1>

      {allDone ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-lg font-medium">{doneCount} file{doneCount !== 1 ? 's' : ''} uploaded</p>
          <button
            onClick={() => router.push('/photos')}
            className="rounded-md bg-foreground px-6 py-2 text-sm text-background hover:opacity-90"
          >
            View Photos
          </button>
          <button
            onClick={() => { setFiles([]); setOverallStatus('idle'); }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Upload More
          </button>
        </div>
      ) : (
        <>
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
              isDragging ? 'border-foreground bg-muted' : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            )}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFilePick}
            />
            <p className="text-lg font-medium">Drop files here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Images, videos, and RAW ({RAW_EXTENSIONS})
            </p>
          </div>

          {/* Queued files */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              {/* Overall progress */}
              {overallStatus === 'uploading' && (
                <div className="mb-2">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-200"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.map((qf) => (
                  <div key={qf.id} className="group relative overflow-hidden rounded-lg border">
                    <div className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qf.thumbnail}
                        alt={qf.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="truncate text-xs text-white">{qf.file.name}</p>
                    </div>
                    {qf.status === 'uploading' && (
                      <div className="absolute inset-0 flex items-end bg-black/40 p-2">
                        <div className="w-full">
                          <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                            <div
                              className="h-full rounded-full bg-white transition-all duration-200"
                              style={{ width: `${qf.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs text-white">{qf.progress}%</p>
                        </div>
                      </div>
                    )}
                    {overallStatus !== 'uploading' && qf.status === 'queued' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(qf.id); }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    )}
                    <div className="absolute left-1 top-1">
                      <div className={cn(
                        'rounded px-1 py-0.5 text-[10px] font-medium text-white',
                        qf.status === 'done' && 'bg-green-500',
                        qf.status === 'error' && 'bg-red-500',
                        qf.status === 'queued' && 'bg-muted-foreground/70',
                        qf.status === 'uploading' && 'bg-blue-500'
                      )}>
                        {qf.status === 'done' ? 'Done' : qf.status === 'error' ? 'Error' : qf.status === 'uploading' ? `${qf.progress}%` : 'Queued'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload button */}
              {overallStatus !== 'uploading' && !allDone && (
                <button
                  onClick={startUpload}
                  disabled={files.every((f) => f.status === 'done')}
                  className="w-full rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                >
                  Upload {files.filter((f) => f.status === 'queued').length} file{files.filter((f) => f.status === 'queued').length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
