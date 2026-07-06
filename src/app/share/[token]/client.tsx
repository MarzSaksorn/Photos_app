'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatFileSize } from '@/lib/utils';

interface ShareData {
  share: {
    id: string;
    resource_type: 'photo' | 'album';
    token: string;
    expires_at: string;
  };
  resource: Record<string, unknown>;
}

export function ShareView({ token }: { token: string }) {
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shares/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Failed to load');
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-muted-foreground">This link has expired or is invalid</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const { share, resource } = data;

  if (share.resource_type === 'photo') {
    const photo = resource as {
      original_filename: string;
      file_size: number;
      width: number;
      height: number;
      taken_at: string;
      uploaded_at: string;
      fullUrl: string;
      is_raw?: boolean;
    };

    return (
      <div className="flex min-h-dvh flex-col bg-black">
        <div className="flex flex-1 items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.fullUrl}
            alt={photo.original_filename}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="bg-black/80 p-4 text-sm text-white">
          <p className="font-medium">{photo.original_filename}</p>
          <p className="mt-1 text-white/70">
            {formatFileSize(photo.file_size)} &middot; {photo.width}&times;{photo.height}
          </p>
          <p className="text-white/70">
            {format(new Date(photo.taken_at || photo.uploaded_at), 'PPP p')}
          </p>
          {photo.is_raw && <p className="mt-1 text-xs text-yellow-400">RAW file</p>}
        </div>
      </div>
    );
  }

  if (share.resource_type === 'album') {
    const album = resource as {
      title: string;
      description?: string;
      photo_count?: number;
      photos?: Array<{
        id: string;
        original_filename: string;
        fullUrl: string;
        width: number;
        height: number;
      }>;
    };

    return (
      <div className="min-h-dvh bg-background p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{album.title}</h1>
          {album.description && (
            <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {album.photos?.length || 0} photo{(album.photos?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {(!album.photos || album.photos.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>No photos in this album</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {album.photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.fullUrl}
                  alt={photo.original_filename}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <p className="text-muted-foreground">Unsupported share type</p>
    </div>
  );
}
