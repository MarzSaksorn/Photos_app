'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconTrash, IconDownload, IconArrowLeft } from '@tabler/icons-react';
import { format } from 'date-fns';
import { formatFileSize } from '@/lib/utils';
import type { Photo } from '@/types';

interface PhotoDetailProps {
  photo: Photo;
  fullUrl: string;
}

export function PhotoDetail({ photo, fullUrl }: PhotoDetailProps) {
  const router = useRouter();
  const [showExif, setShowExif] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this photo?')) return;
    await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' });
    router.push('/photos');
  };

  const handleDownload = async () => {
    const res = await fetch(fullUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = photo.original_filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="text-white hover:opacity-80">
          <IconArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex gap-4">
          <button onClick={() => setShowExif(!showExif)} className="text-white hover:opacity-80">
            <span className="text-sm">Info</span>
          </button>
          <button onClick={handleDownload} className="text-white hover:opacity-80">
            <IconDownload className="h-5 w-5" />
          </button>
          <button onClick={handleDelete} className="text-white hover:opacity-80">
            <IconTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullUrl}
          alt={photo.original_filename}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* EXIF panel */}
      {showExif && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4 text-sm text-white">
          <p>{photo.original_filename}</p>
          <p>{formatFileSize(photo.file_size)} &middot; {photo.width}&times;{photo.height}</p>
          <p>{format(new Date(photo.taken_at || photo.uploaded_at), 'PPP p')}</p>
          {photo.is_raw && <p className="mt-1 text-xs text-yellow-400">RAW file</p>}
        </div>
      )}
    </div>
  );
}
