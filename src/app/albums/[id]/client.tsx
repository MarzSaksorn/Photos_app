'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Album } from '@/types';
import { useAlbumPhotos, useUpdateAlbum, useDeleteAlbum, useRemovePhotoFromAlbum } from '@/hooks/use-albums';
import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';

interface AlbumDetailClientProps {
  album: Album;
}

export function AlbumDetailClient({ album }: AlbumDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: photos, isLoading } = useAlbumPhotos(album.id);
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const removePhoto = useRemovePhotoFromAlbum();

  const handleSaveTitle = useCallback(async () => {
    if (!title.trim() || title === album.title) {
      setIsEditing(false);
      return;
    }
    await updateAlbum.mutateAsync({ id: album.id, title: title.trim(), description: description.trim() });
    setIsEditing(false);
  }, [title, description, album.id, album.title, updateAlbum]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this album? Photos will not be deleted.')) return;
    await deleteAlbum.mutateAsync(album.id);
    queryClient.invalidateQueries({ queryKey: ['albums'] });
    router.push('/albums');
  }, [album.id, deleteAlbum, queryClient, router]);

  const handleRemovePhoto = useCallback(async (photoId: string) => {
    await removePhoto.mutateAsync({ albumId: album.id, photoId });
  }, [album.id, removePhoto]);

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/albums" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Albums
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') { setTitle(album.title); setDescription(album.description); setIsEditing(false); } }}
                className="rounded border px-2 py-1 text-lg font-semibold"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveTitle}
                placeholder="Add a description"
                className="rounded border px-2 py-1 text-sm"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h1
                className="cursor-pointer text-xl font-semibold hover:text-muted-foreground"
                onClick={() => setIsEditing(true)}
              >
                {album.title}
              </h1>
              {album.description && (
                <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="rounded bg-destructive px-3 py-1 text-xs text-destructive-foreground hover:opacity-90"
        >
          Delete
        </button>
      </div>

      {isLoading ? (
        <div>
          <div className="mb-6 space-y-2">
            <SkeletonText width="8rem" />
            <SkeletonText width="4rem" height="0.75rem" />
          </div>
          <SkeletonGrid
            count={12}
            cols="grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        </div>
      ) : !photos?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">No photos in this album</p>
          <p className="text-sm">Add photos from the photos page</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
              <Link href={`/photos/${photo.id}`}>
                <img
                  src={`/api/photos/${photo.id}/thumbnail`}
                  alt={photo.original_filename}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </Link>
              <button
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute right-1 top-1 rounded bg-destructive/80 px-1.5 py-0.5 text-[10px] text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
