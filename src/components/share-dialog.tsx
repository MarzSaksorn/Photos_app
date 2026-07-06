'use client';

import { useState } from 'react';
import { IconShare, IconCopy, IconCheck } from '@tabler/icons-react';

interface ShareDialogProps {
  resourceType: 'photo' | 'album';
  resourceId: string;
}

export function ShareDialog({ resourceType, resourceId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(resourceType);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setShareUrl(null);

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: type, resourceId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create share link');
      }

      const data = await res.json();
      setShareUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        <IconShare className="h-4 w-4" />
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Share</h2>

            {!shareUrl && (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="share-type" className="text-sm font-medium">
                    Resource Type
                  </label>
                  <select
                    id="share-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'photo' | 'album')}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="photo">Photo</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Share Link'}
                </button>
              </div>
            )}

            {shareUrl && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can view the shared content for 7 days.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                  >
                    {copied ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconCopy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { setOpen(false); setShareUrl(null); setError(null); setCopied(false); }}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
