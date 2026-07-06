'use client';

import { cn } from '@/lib/utils';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  onCancel?: () => void;
}

export function UploadProgress({ fileName, progress, status, onCancel }: UploadProgressProps) {
  const statusLabel: Record<typeof status, string> = {
    queued: 'Waiting...',
    uploading: `${progress}%`,
    done: 'Complete',
    error: 'Failed',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate max-w-[70%]">{fileName}</span>
        <span className="flex items-center gap-2">
          <span className={cn(
            'text-xs',
            status === 'error' && 'text-red-500',
            status === 'done' && 'text-green-500'
          )}>
            {statusLabel[status]}
          </span>
          {status === 'uploading' && onCancel && (
            <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-200',
            status === 'error' && 'bg-red-500',
            status === 'done' && 'bg-green-500',
            status !== 'error' && status !== 'done' && 'bg-foreground'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
