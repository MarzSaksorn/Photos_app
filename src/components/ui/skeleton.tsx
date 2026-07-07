import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md',
        shimmer ? 'skeleton-shimmer' : 'bg-muted',
        className
      )}
      {...props}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return <Skeleton className={cn('aspect-square', className)} />;
}

interface SkeletonTextProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonText({ className, width, height }: SkeletonTextProps) {
  return (
    <Skeleton
      className={cn('h-4', className)}
      style={{ width: width || '100%', height: height || '1rem' }}
    />
  );
}

interface SkeletonCircleProps {
  className?: string;
  size?: string;
}

export function SkeletonCircle({ className, size }: SkeletonCircleProps) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{ width: size || '5rem', height: size || '5rem' }}
    />
  );
}

interface SkeletonGridProps {
  count: number;
  cols: string;
  gap?: string;
  cardProps?: SkeletonCardProps;
}

export function SkeletonGrid({ count, cols, gap, cardProps }: SkeletonGridProps) {
  return (
    <div className={cn('grid', cols, gap || 'gap-1')}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...cardProps} />
      ))}
    </div>
  );
}
