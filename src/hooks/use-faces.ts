'use client';

import { useQuery } from '@tanstack/react-query';
import type { FaceGroup } from '@/types';

export function useFaces() {
  return useQuery({
    queryKey: ['faces'],
    queryFn: async () => {
      const res = await fetch('/api/faces');
      if (!res.ok) throw new Error('Failed to fetch faces');
      const data = await res.json();
      return data.faceGroups as (FaceGroup & { photo_count: number })[];
    },
  });
}
