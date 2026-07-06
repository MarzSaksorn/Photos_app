'use client';

import { type ScanProgress } from '@/types';
import { cn } from '@/lib/utils';

interface FaceScanProgressProps {
  progress: ScanProgress;
  onPause: () => void;
  onResume: () => void;
  onDismiss: () => void;
}

export function FaceScanProgress({
  progress,
  onPause,
  onResume,
  onDismiss,
}: FaceScanProgressProps) {
  if (progress.status === 'idle') return null;
  if (progress.status === 'done') {
    return (
      <div className="fixed left-0 right-0 top-0 z-40 bg-green-50 px-4 py-2 text-sm text-green-800">
        Face scanning complete — {progress.facesFound} faces found
        <button onClick={onDismiss} className="ml-2 underline">Dismiss</button>
      </div>
    );
  }

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="fixed left-0 right-0 top-0 z-40 bg-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {progress.status === 'scanning' ? 'Scanning faces' : 'Clustering faces...'}
        </span>
        <span className="text-muted-foreground">
          {progress.completed} / {progress.total} · {progress.facesFound} faces
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            progress.status === 'clustering' ? 'w-full animate-pulse bg-blue-500' : 'bg-foreground'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {progress.currentPhoto || 'Processing...'}
        </span>
        <div className="flex gap-2">
          {progress.status === 'scanning' && (
            <button onClick={onPause} className="text-xs underline">Pause</button>
          )}
          {progress.status === 'paused' && (
            <button onClick={onResume} className="text-xs underline">Resume</button>
          )}
        </div>
      </div>
    </div>
  );
}
