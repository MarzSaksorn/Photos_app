'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { Photo } from '@/types';

async function fetchPhotos({ pageParam }: { pageParam: string | null }) {
  const params = new URLSearchParams();
  if (pageParam) params.set('cursor', pageParam);
  params.set('limit', '30');

  const res = await fetch(`/api/photos?${params}`);
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json() as Promise<{ photos: Photo[]; nextCursor: string | null }>;
}

export function usePhotos() {
  return useInfiniteQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
