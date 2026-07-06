'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbums } from '@/hooks/use-albums';
import { AlbumCard } from './album-card';
import { CreateAlbumDialog } from './create-album-dialog';

export function AlbumGrid() {
  const { data: albums, isLoading } = useAlbums();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (!albums?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No albums yet</p>
        <p className="text-sm">Create your first album to organize your photos</p>
        <button
          onClick={() => setShowCreate(true)}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Create Album
        </button>
        <CreateAlbumDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
      <CreateAlbumDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => {
          setShowCreate(false);
          router.refresh();
        }}
      />
    </>
  );
}
