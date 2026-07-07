'use client';

import { useState } from 'react';
import type { Photo } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { IconPhoto } from '@tabler/icons-react';

interface PhotoCardProps {
  photo: Photo;
  priority?: boolean;
}

export function PhotoCard({ photo, priority }: PhotoCardProps) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = `/api/photos/${photo.id}/thumbnail`;

  return (
    <Link
      href={`/photos/${photo.id}`}
      className="group relative aspect-square overflow-hidden rounded-md bg-muted"
    >
      {imgError ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <IconPhoto className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={thumbUrl}
          alt={photo.original_filename}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      )}
      {photo.is_raw && (
        <span className="absolute left-1 top-1 rounded bg-foreground/80 px-1 py-0.5 text-[10px] text-background">
          RAW
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-[11px] text-white">
          {format(new Date(photo.taken_at || photo.uploaded_at), 'MMM d, yyyy')}
        </span>
      </div>
    </Link>
  );
}
