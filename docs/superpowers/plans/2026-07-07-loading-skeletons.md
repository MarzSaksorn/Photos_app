# Loading Skeleton System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all ad-hoc `animate-pulse` loading states with a cohesive system of reusable skeleton primitives featuring a polished CSS shimmer animation.

**Architecture:** Create `src/components/ui/skeleton.tsx` with base `Skeleton` + layout primitives (`SkeletonCard`, `SkeletonText`, `SkeletonCircle`, `SkeletonGrid`). Add shimmer keyframe to `globals.css`. Update each page component to use the primitives with layout-matching grids.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, shadcn/ui conventions

## Global Constraints

- All skeletons must respect `prefers-reduced-motion` (collapse to static muted bg)
- Skeleton grid dimensions must match the real content grid (same columns, gap, breakpoints)
- Shimmer animation: diagonal gradient sweep, 1.5s duration, CSS `@keyframes` only
- Primitives go in `src/components/ui/skeleton.tsx`

---

### Task 1: Shimmer animation + Skeleton primitives

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/skeleton.tsx`

**Interfaces:**
- Produces: CSS `@keyframes shimmer` in globals.css, exported components `<Skeleton className>`, `<SkeletonCard>`, `<SkeletonText>`, `<SkeletonCircle>`, `<SkeletonGrid>`

- [ ] **Step 1: Add shimmer keyframe to globals.css**

Add before the `@layer base` block:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

Add a utility class after the `@layer base` block:

```css
@layer utilities {
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)) 25%,
      hsl(var(--muted) / 0.6) 37%,
      hsl(var(--muted)) 63%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-shimmer {
      animation: none;
      background: hsl(var(--muted));
    }
  }
}
```

- [ ] **Step 2: Create `<Skeleton>` base component**

`src/components/ui/skeleton.tsx`:

```tsx
'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

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
```

- [ ] **Step 3: Create layout primitives**

Add to same file:

```tsx
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
```

Update import to include `cn`:

```tsx
import { cn } from '@/lib/utils';
```

- [ ] **Step 4: Verify clean build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/ui/skeleton.tsx
git commit -m "feat: add shimmer animation and skeleton primitives"
```

---

### Task 2: PhotoGrid — replace pulse with SkeletonGrid

**Files:**
- Modify: `src/components/photo-grid.tsx`

**Interfaces:**
- Consumes: `<SkeletonGrid>` from `./ui/skeleton`
- No new interfaces produced

- [ ] **Step 1: Replace loading state**

In `src/components/photo-grid.tsx`, replace the loading block (lines 26-34):

```tsx
import { SkeletonGrid } from './ui/skeleton';
```

Replace:

```tsx
if (isLoading) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
```

With:

```tsx
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
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/photo-grid.tsx
git commit -m "feat: replace photo grid loading with SkeletonGrid"
```

---

### Task 3: AlbumGrid — replace pulse with SkeletonGrid

**Files:**
- Modify: `src/components/album-grid.tsx`

- [ ] **Step 1: Replace loading state**

```tsx
import { SkeletonGrid } from './ui/skeleton';
```

Replace the loading block (lines 14-22):

```tsx
if (isLoading) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
```

With:

```tsx
if (isLoading) {
  return (
    <SkeletonGrid
      count={10}
      cols="grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    />
  );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/album-grid.tsx
git commit -m "feat: replace album grid loading with SkeletonGrid"
```

---

### Task 4: FaceGroupsGrid — replace pulse circles with skeleton primitives

**Files:**
- Modify: `src/components/face-groups-grid.tsx`

- [ ] **Step 1: Replace loading state**

```tsx
import { SkeletonCircle, SkeletonText } from './ui/skeleton';
```

Replace the loading block (lines 9-19):

```tsx
if (isLoading) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
```

With:

```tsx
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
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/face-groups-grid.tsx
git commit -m "feat: replace face groups loading with SkeletonCircle + SkeletonText"
```

---

### Task 5: AlbumDetail — replace pulse with SkeletonGrid + header skeleton

**Files:**
- Modify: `src/app/albums/[id]/client.tsx`

- [ ] **Step 1: Replace loading state**

```tsx
import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';
```

Replace the loading block (lines 101-107):

```tsx
{isLoading ? (
  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
    ))}
  </div>
) : ...}
```

With:

```tsx
{isLoading ? (
  <div>
    <div className="mb-6 space-y-2">
      <SkeletonText width="8rem" />
      <SkeletonText width="4rem" height="0.75rem" />
    </div>
    <SkeletonGrid
      count={12}
      cols="grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    />
  </div>
) : ...}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/albums/\[id\]/client.tsx
git commit -m "feat: replace album detail loading with skeleton primitives"
```

---

### Task 6: PhotoDetail — replace spinner with full-screen skeleton

**Files:**
- Modify: `src/app/photos/[id]/client.tsx`

- [ ] **Step 1: Replace spinner loading state**

```tsx
import { Skeleton } from '@/components/ui/skeleton';
```

Replace the loading block (lines 16-22):

```tsx
if (!fullUrl) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}
```

With:

```tsx
if (!fullUrl) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-10 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Skeleton className="h-full max-h-[80vh] w-full max-w-[70vw] rounded-lg" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/photos/\[id\]/client.tsx
git commit -m "feat: replace photo detail spinner with full-screen skeleton"
```

---

### Task 7: FaceGroupDetail — replace pulse with SkeletonGrid

**Files:**
- Modify: `src/app/faces/[id]/client.tsx`

- [ ] **Step 1: Replace loading state**

```tsx
import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';
```

Replace the loading block (lines 106-112):

```tsx
{isLoading ? (
  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
    ))}
  </div>
) : ...}
```

With:

```tsx
{isLoading ? (
  <div>
    <div className="mb-6 space-y-2">
      <SkeletonText width="8rem" />
    </div>
    <SkeletonGrid
      count={12}
      cols="grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    />
  </div>
) : ...}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/faces/\[id\]/client.tsx
git commit -m "feat: replace face detail loading with SkeletonGrid"
```

---

### Task 8: SearchOverlay — replace pulse sections with skeleton primitives

**Files:**
- Modify: `src/components/search-overlay.tsx`

- [ ] **Step 1: Replace loading sections**

```tsx
import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';
```

Replace the loading block (lines 99-112):

```tsx
{loading && (
  <div className="space-y-6">
    {[1, 2, 3].map((section) => (
      <div key={section}>
        <div className="mb-3 h-5 w-20 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    ))}
  </div>
)}
```

With:

```tsx
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
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/search-overlay.tsx
git commit -m "feat: replace search loading with skeleton primitives"
```

---

### Task 9: Final build verification

**Files:** None

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Clean exit (no errors, no warnings)

- [ ] **Step 2: Quick smoke test**

Run: `npm run dev` (start and verify pages load without crashing)

- [ ] **Step 3: Update TODO.md**

```bash
git add .
git commit -m "chore: complete loading skeleton system"
```
