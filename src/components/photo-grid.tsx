'use client';

import { usePhotos } from '@/hooks/use-photos';
import { PhotoCard } from './photo-card';
import { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { SkeletonGrid } from './ui/skeleton';

export function PhotoGrid() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePhotos();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPhotoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (isLoading) {
    return (
      <div className="px-1">
        <SkeletonGrid
          count={20}
          cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        />
      </div>
    );
  }

  const allPhotos = data?.pages.flatMap((p) => p.photos) ?? [];

  if (allPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No photos yet</p>
        <p className="text-sm">Tap + to upload your first photo</p>
      </div>
    );
  }

  const sections: { date: string; photos: typeof allPhotos }[] = [];
  allPhotos.forEach((photo) => {
    const date = format(new Date(photo.taken_at || photo.uploaded_at), 'yyyy-MM-dd');
    const last = sections[sections.length - 1];
    if (last && last.date === date) {
      last.photos.push(photo);
    } else {
      sections.push({ date, photos: [photo] });
    }
  });

  return (
    <div className="px-1">
      {sections.map((section, i) => (
        <div key={section.date}>
          <h2 className="px-2 py-3 text-sm font-medium text-muted-foreground">
            {format(new Date(section.date), 'MMMM d, yyyy')}
          </h2>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {section.photos.map((photo, j) => (
              <div
                key={photo.id}
                ref={i === sections.length - 1 && j === section.photos.length - 1 ? lastPhotoRef : undefined}
              >
                <PhotoCard photo={photo} priority={i === 0 && j < 6} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">
          Loading more...
        </div>
      )}
    </div>
  );
}
