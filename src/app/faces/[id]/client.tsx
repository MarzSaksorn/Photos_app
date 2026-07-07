'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Photo, FaceGroup } from '@/types';
import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';

interface FaceGroupDetailClientProps {
  group: FaceGroup;
}

export function FaceGroupDetailClient({ group }: FaceGroupDetailClientProps) {
  const [name, setName] = useState(group.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [mergeId, setMergeId] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['face-photos', group.id],
    queryFn: async () => {
      const res = await fetch(`/api/faces/${group.id}/photos?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch photos');
      return res.json() as Promise<{ photos: Photo[]; nextCursor: string | null }>;
    },
  });

  const handleRename = useCallback(async () => {
    if (!name.trim() || name === group.name) {
      setIsEditing(false);
      return;
    }
    const res = await fetch(`/api/faces/${group.id}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['faces'] });
      setIsEditing(false);
    }
  }, [name, group.id, group.name, queryClient]);

  const handleMerge = useCallback(async () => {
    if (!mergeId.trim() || mergeId === group.id) return;
    const res = await fetch('/api/faces/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: group.id, targetId: mergeId.trim() }),
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['faces'] });
      window.location.href = `/faces/${mergeId.trim()}`;
    }
  }, [mergeId, group.id, queryClient]);

  const photos = data?.photos ?? [];

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/faces" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; People
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setName(group.name || ''); setIsEditing(false); } }}
              className="rounded border px-2 py-1 text-lg font-semibold"
              autoFocus
            />
          </div>
        ) : (
          <h1
            className="cursor-pointer text-xl font-semibold hover:text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            {group.name || 'Unnamed'}
          </h1>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Merge target ID..."
            value={mergeId}
            onChange={(e) => setMergeId(e.target.value)}
            className="w-40 rounded border px-2 py-1 text-xs"
          />
          <button
            onClick={handleMerge}
            disabled={!mergeId.trim() || mergeId === group.id}
            className="rounded bg-destructive px-3 py-1 text-xs text-destructive-foreground hover:opacity-90 disabled:opacity-50"
          >
            Merge
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>
          <div className="mb-6 space-y-2">
            <SkeletonText width="8rem" />
          </div>
          <SkeletonGrid
            count={12}
            cols="grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">No photos in this group</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/photos/${photo.id}`}
              className="group relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <img
                src={`/api/photos/${photo.id}/thumbnail`}
                alt={photo.original_filename}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
