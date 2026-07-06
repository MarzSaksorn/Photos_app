'use client';

import Link from 'next/link';
import type { FaceGroup } from '@/types';

interface FaceGroupCardProps {
  group: FaceGroup & { photo_count: number };
}

export function FaceGroupCard({ group }: FaceGroupCardProps) {
  return (
    <Link
      href={`/faces/${group.id}`}
      className="group flex flex-col items-center gap-2 rounded-lg p-4 hover:bg-muted transition-colors"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
        {group.name?.[0] || '?'}
      </div>
      <span className="text-sm font-medium">{group.name}</span>
      <span className="text-xs text-muted-foreground">{group.photo_count} photos</span>
    </Link>
  );
}
