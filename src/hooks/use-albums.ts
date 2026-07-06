'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Album, Photo } from '@/types';

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const res = await fetch('/api/albums');
      if (!res.ok) throw new Error('Failed to fetch albums');
      const data = await res.json();
      return data.albums as Album[];
    },
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const res = await fetch(`/api/albums/${id}`);
      if (!res.ok) throw new Error('Failed to fetch album');
      const data = await res.json();
      return data.album as Album;
    },
    enabled: !!id,
  });
}

export function useAlbumPhotos(id: string) {
  return useQuery({
    queryKey: ['album-photos', id],
    queryFn: async () => {
      const res = await fetch(`/api/albums/${id}/photos?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch album photos');
      const data = await res.json();
      return data.photos as Photo[];
    },
    enabled: !!id,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to create album');
      return res.json() as Promise<{ album: Album }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title?: string; description?: string }) => {
      const res = await fetch(`/api/albums/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to update album');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.id] });
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete album');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useAddPhotoToAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, photoId }: { albumId: string; photoId: string }) => {
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });
      if (!res.ok) throw new Error('Failed to add photo');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['album-photos', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useRemovePhotoFromAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, photoId }: { albumId: string; photoId: string }) => {
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });
      if (!res.ok) throw new Error('Failed to remove photo');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['album-photos', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}
