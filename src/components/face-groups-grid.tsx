'use client';

import { useFaces } from '@/hooks/use-faces';
import { FaceGroupCard } from './face-group-card';
import { SkeletonCircle, SkeletonText } from './ui/skeleton';

export function FaceGroupsGrid() {
  const { data: groups, isLoading } = useFaces();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <SkeletonCircle size="5rem" />
            <SkeletonText width="4rem" />
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
