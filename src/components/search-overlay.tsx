'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconSearch, IconPhoto, IconUsers, IconAlbum } from '@tabler/icons-react';
import type { Photo, FaceGroup, Album } from '@/types';
import { SkeletonGrid, SkeletonText } from './ui/skeleton';

interface SearchResults {
  photos: Photo[];
  faceGroups: (FaceGroup & { photo_count: number })[];
  albums: Album[];
}

export function SearchOverlay() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResults = await res.json();
      setResults(data);
    } catch {
      setResults({ photos: [], faceGroups: [], albums: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  }

  function handleClear() {
    setQuery('');
    setResults(null);
    setSearched(false);
    inputRef.current?.focus();
  }

  const hasPhotos = results && results.photos.length > 0;
  const hasFaceGroups = results && results.faceGroups.length > 0;
  const hasAlbums = results && results.albums.length > 0;
  const hasAnyResults = hasPhotos || hasFaceGroups || hasAlbums;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/photos"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search photos, people, albums..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {loading && (
          <div className="space-y-6">
            {[0, 1, 2].map((section) => (
              <div key={section}>
                <div className="mb-3">
                  <SkeletonText width="5rem" height="1.25rem" />
                </div>
                <SkeletonGrid
                  count={6}
                  cols="grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6"
                />
              </div>
            ))}
          </div>
        )}

        {searched && !loading && !hasAnyResults && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <IconSearch className="mb-2 h-8 w-8" />
            <p className="text-lg">No results found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <IconSearch className="mb-2 h-8 w-8" />
            <p className="text-lg">Search your library</p>
            <p className="text-sm">Find photos, people, and albums</p>
          </div>
        )}

        {results && hasPhotos && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <IconPhoto className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">
                Photos ({results.photos.length})
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {results.photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photos/${photo.id}`}
                  className="group relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <img
                    src={`/api/photos/${photo.id}/thumbnail`}
                    alt={photo.original_filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {results && hasFaceGroups && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">
                People ({results.faceGroups.length})
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {results.faceGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/faces/${group.id}`}
                  className="group flex flex-col items-center gap-2 rounded-lg p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                    {group.name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium">{group.name}</span>
                  <span className="text-xs text-muted-foreground">{group.photo_count} photos</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results && hasAlbums && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <IconAlbum className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">
                Albums ({results.albums.length})
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {results.albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <IconAlbum className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{album.title}</p>
                    <p className="text-xs text-muted-foreground">{album.photo_count} photos</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
