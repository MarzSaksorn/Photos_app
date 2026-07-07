# Loading Skeleton System

## Objective

Replace all ad-hoc `animate-pulse` divs and spinners across the Photos app with a cohesive system of reusable skeleton primitives featuring a polished CSS shimmer animation.

## Architecture

### Component Tree

```
Skeleton (base)           — <div> with shimmer animation, className for sizing
├── SkeletonCard          — aspect-square rounded-md, for photo/album thumbnails
├── SkeletonText          — rounded line, configurable width/height
├── SkeletonCircle        — rounded-full, for face avatars
└── SkeletonGrid          — renders N SkeletonCards in a grid matching page layout
```

### Shimmer Animation

Replaces `animate-pulse` with a diagonal gradient sweep:

- Base color: `var(--muted)` (neutral gray)
- Highlight sweep: lighter variant traveling top-left to bottom-right
- Duration: 1.5s, infinite loop
- Respects `prefers-reduced-motion`: collapses to static `var(--muted)` background

### File Location

All primitives in `src/components/ui/skeleton.tsx` (shadcn/ui convention).

---

## Page Skeleton Layouts

Each page or client component gets a skeleton that mirrors its final layout — same grid columns, same breakpoints, same dimensions — so the user sees a faithful outline of the content before it arrives.

### `/photos` — PhotoGrid

- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1`
- Count: 20 cards
- Each card: `SkeletonCard` (aspect-square)

### `/albums` — AlbumGrid

- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`
- Count: 10 cards
- Each card: `SkeletonCard` (aspect-square)

### `/albums/[id]` — AlbumDetail

- Header skeleton: back link + title line (SkeletonText) + photo count line
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1`
- Count: 12 cards
- No date sections (album photos aren't date-grouped)

### `/faces` — FaceGroupsGrid

- Grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4`
- Count: 12 items
- Each item: centered `SkeletonCircle` (h-20 w-20) + `SkeletonText` (w-16 h-4) below

### `/faces/[id]` — FaceDetail

- Header: name line + photo count line
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1`
- Count: 12 cards

### `/photos/[id]` — PhotoDetail (full-screen)

- Full-screen black background
- Centered `SkeletonCard` at 70vw max (approximating image area)
- Top toolbar skeleton: back button + action buttons

### `/search` — SearchOverlay

- 3 skeleton sections (photos, people, albums)
- Each section: `SkeletonText` header + `SkeletonGrid` of 6 thumbnails
- Same breakpoint-specific column counts as the real results

---

## Transition Behavior

When real content replaces the skeleton:

1. Skeleton opacity → 0 over 200ms
2. Real content opacity → 1 over 200ms (staggered if multiple items)
3. No layout shift — skeleton dimensions match real content dimensions

Implementation: skeleton and real content coexist briefly; the skeleton fades out while the real content fades in.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/photo-grid.tsx` | Replace inline pulse divs with `SkeletonGrid` |
| `src/components/album-grid.tsx` | Same |
| `src/components/face-groups-grid.tsx` | Replace pulse circles/text with `SkeletonCircle` + `SkeletonText` |
| `src/components/search-overlay.tsx` | Replace pulse sections with skeleton primitives |
| `src/app/albums/[id]/client.tsx` | Replace pulse grid with `SkeletonGrid` |
| `src/app/photos/[id]/client.tsx` | Replace spinner with full-screen skeleton |
| `src/app/faces/[id]/page.tsx` | Add skeleton loading state |
| `src/components/ui/skeleton.tsx` | **New** — skeleton primitives |
| `src/app/globals.css` | Add shimmer keyframe animation |
