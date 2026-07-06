'use client';

import { useFaces } from '@/hooks/use-faces';
import { FaceGroupCard } from './face-group-card';

export function FaceGroupsGrid() {
  const { data: groups, isLoading } = useFaces();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!groups?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No face groups yet</p>
        <p className="text-sm">Upload photos and run face scanning to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {groups.map((group) => (
        <FaceGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
