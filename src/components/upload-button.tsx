'use client';

import { useRef } from 'react';
import { useUpload } from '@/hooks/use-upload';
import { IconPlus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function UploadButton({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, uploadFile } = useUpload();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={state.status === 'uploading'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-90 disabled:opacity-50',
          className
        )}
      >
        {state.status === 'uploading' ? (
          <span className="text-xs">{state.progress}%</span>
        ) : (
          <IconPlus className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
