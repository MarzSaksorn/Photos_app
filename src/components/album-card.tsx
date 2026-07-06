'use client';

import Link from 'next/link';
import type { Album } from '@/types';

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const coverUrl = album.cover_photo_id
    ? `/api/photos/${album.cover_photo_id}/thumbnail`
    : null;

  return (
    <Link
      href={`/albums/${album.id}`}
      className="group relative flex aspect-square flex-col overflow-hidden rounded-md bg-muted"
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={album.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-4xl text-muted-foreground/40">{album.title[0]?.toUpperCase() || 'A'}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <h3 className="truncate text-sm font-medium text-white">{album.title}</h3>
        <p className="text-xs text-white/70">
          {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
        </p>
      </div>
    </Link>
  );
}
