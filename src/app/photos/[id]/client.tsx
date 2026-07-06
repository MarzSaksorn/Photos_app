'use client';

import { useEffect, useState } from 'react';
import { PhotoDetail } from '@/components/photo-detail';
import type { Photo } from '@/types';

export function PhotoDetailClient({ photo }: { photo: Photo }) {
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/photos/${photo.id}`)
      .then((r) => r.json())
      .then((data) => setFullUrl(data.fullUrl));
  }, [photo.id]);

  if (!fullUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return <PhotoDetail photo={photo} fullUrl={fullUrl} />;
}
