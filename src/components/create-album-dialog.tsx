'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAlbum } from '@/hooks/use-albums';

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAlbumDialog({ open, onOpenChange, onSuccess }: CreateAlbumDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createAlbum = useCreateAlbum();
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const result = await createAlbum.mutateAsync({
        title: title.trim(),
        description: description.trim(),
      });
      setTitle('');
      setDescription('');
      onSuccess?.();
      router.push(`/albums/${result.album.id}`);
    } catch {
      // error handled by react-query
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Create Album</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Album title"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              autoFocus
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createAlbum.isPending}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
            >
              {createAlbum.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
