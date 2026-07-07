'use client';

import { useEffect, useState } from 'react';
import { PhotoDetail } from '@/components/photo-detail';
import type { Photo } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function PhotoDetailClient({ photo }: { photo: Photo }) {
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/photos/${photo.id}`)
      .then((r) => r.json())
      .then((data) => setFullUrl(data.fullUrl));
  }, [photo.id]);

  if (!fullUrl) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between p-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-10 rounded" />
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <Skeleton className="h-full max-h-[80vh] w-full max-w-[70vw] rounded-lg" />
        </div>
      </div>
    );
  }

  return <PhotoDetail photo={photo} fullUrl={fullUrl} />;
}
