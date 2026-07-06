# Photos App — Design Spec

**Date:** 2026-07-06
**Status:** Approved
**Source:** PRD.md (iterated with user)

---

## Overview

A Google Photos-inspired web app for photo/video backup, organization, and face group recognition. Users bring their own Cloudflare R2 bucket. All face processing runs client-side. Built as a Next.js PWA, with native iOS/Android apps planned for Phase 2.

---

## Architecture

```
[Client Browser/PWA]
    ├── Web Worker (face-api.js detection + recognition)
    ├── IndexedDB (progress persistence, face descriptors cache)
    ├── Service Worker (offline cache, background sync)
    ├── React UI (grid, albums, search, status bar)
    └── Status Bar Component (processing progress, resumable)
          ↕ HTTPS / Presigned URLs
[Next.js App (Vercel)]
    ├── API Routes (auth, metadata, search, face group CRUD)
    └── Server Actions (upload initiation)
        ↕
[Supabase / Postgres + pgvector]
    └── User auth, photo metadata, face descriptors, albums, shares, app settings
        ↕
[User's Cloudflare R2 Bucket]
    └── Original photos (RAW, JPEG, HEIC), videos (MP4, MOV), thumbnails
```

---

## Phase 1 (MVP — Web PWA)

### Features
- Google OAuth + Supabase user management
- R2 storage integration (user provides own bucket: endpoint, access key, secret, bucket name)
- RAW photo support (CR2, NEF, ARW, DNG, RAF, ORF, RW2 + any via libraw)
- Direct-to-R2 upload via presigned URLs
- Chronological photo grid with infinite scroll
- Photo detail view with EXIF metadata
- Basic editing: crop (aspect ratios), rotate/flip, 5–8 preset filters (non-destructive)
- Face detection + recognition via face-api.js in a Web Worker
- Face scanning progress bar with ETA, pause/resume, resumable on tab close (IndexedDB)
- Shared Worker keeps scanning alive across tabs — close one tab, worker migrates to another
- On revisit: service worker checks IndexedDB for incomplete scan, auto-restarts worker
- Videos skipped during face processing
  - 128-d descriptors computed in-browser via TensorFlow.js WebGL
  - Local DBSCAN clustering after all photos processed
  - Results synced to Postgres + pgvector
- Face group browsing, naming, merge/split
- Video playback (MP4, MOV — direct download, no transcoding)
- Search by date and person
- Albums (CRUD with drag-to-reorder)
- Shareable photo links (signed URL with expiry, no auth required to view)
- PWA: service worker, manifest, offline thumbnail cache (last 500 photos)

### Non-Features (Phase 1)
- No video transcoding (Phase 2)
- No full photo editing suite (external editors handle advanced edits)
- No native apps (Phase 2)
- No password-protected shares (Phase 2)
- No admin panel (Phase 2)

---

## Phase 2

- Native iOS app (background upload, share sheet, widgets)
- Native Android app (WorkManager, notifications)
- Video transcoding for HLS streaming (FFmpeg worker on Railway/Fly.io)
- Password-protected shares
- Admin panel: user management, storage quotas, suspend/activate accounts, global settings
- "Open in external editor" flow

---

## Face Recognition Pipeline

1. User clicks "Scan faces" or it auto-runs after upload batch
2. Web Worker loads face-api.js models (20MB, cached via service worker)
3. Photos processed in batches of 10, yielding to UI between batches:
   a. Fetch thumbnail from R2 (low-res)
   b. Skip videos
   c. Detect faces via face-api.js (SSD Mobilenet v1, WebGL backend)
   d. Compute 128-d descriptor for each face
   e. Store in IndexedDB: photo_id, descriptor, bounding_box, thumbnail
4. Progress bar updates reactively: "342 / 5,241 photos · 12 faces found · ~3m remaining"
5. On completion: DBSCAN clustering (cosine similarity, epsilon=0.5, min_samples=2)
6. Results synced to server: face groups + descriptors in pgvector
7. New uploads: detect on single photo, match against existing clusters via cosine similarity

---

## Data Model

- **User:** id, email, name, avatar_url, r2_config (encrypted JSON), storage_quota_bytes, role (user | admin), created_at
- **Photo:** id, user_id, r2_key, original_filename, file_size, mime_type, is_raw (boolean), width, height, taken_at (from EXIF), uploaded_at, deleted_at, crop_data (JSON), filters (JSON), rotation (int)
- **Video:** id, user_id, r2_key, original_filename, file_size, mime_type, duration_secs, width, height, taken_at, uploaded_at, transcode_status (pending | processing | done | failed), hls_playlist_key
- **Face:** id, photo_id, embedding (vector(128)), bounding_box (JSON), cluster_id
- **FaceCluster:** id, user_id, name, cover_face_id
- **Album:** id, user_id, title, description, cover_photo_id, created_at, updated_at
- **AlbumPhoto:** album_id, photo_id, sort_order
- **Share:** id, user_id, resource_type (photo | album | video), resource_id, token, password_hash, expires_at
- **AppSetting:** id, key, value (JSON), updated_at

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), Tailwind CSS v4, shadcn/ui, face-api.js, @tanstack/react-query, react-photo-view, Workbox, idb
- **Backend:** Next.js API Routes + Server Actions, Supabase (Postgres + pgvector + Auth)
- **Infrastructure:** Vercel, Supabase, Cloudflare R2 (user's own), FFmpeg worker (Phase 2)

---

## Key UX Screens

1. **Photo Grid** — chronological, infinite scroll, date headers, upload FAB
2. **Photo Detail** — full-res with pinch-zoom, EXIF overlay, face tags, swipe navigation
3. **Face Scanning Progress** — persistent status bar, pause/resume, dismissible
4. **Face Groups** — grid of group cards, tap → person's photos, merge/split
5. **Albums** — cover + title + count, drag-to-reorder within album
6. **Search** — full-screen overlay, results grouped by type
7. **Share View** — no-auth page, optional password (Phase 2), download button

---

## Security

- Auth: Supabase + Google OAuth
- Storage: Presigned URLs (15min upload, 1hr view)
- R2 credentials stored AES-256 encrypted
- Rate limiting: 100 uploads/hr, 1000 searches/hr per user
- CORS restricted to app domain

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Grid initial load | < 2s (30 photos) |
| Infinite scroll append | < 200ms |
| Face per-photo (GPU) | 200–500ms |
| 5000-photo batch | ~15–30 min (non-blocking, resumable) |
| Upload (10MB) | < 5s |

---

## Risks

- Browser tab closed mid-processing → mitigated by IndexedDB per-photo persistence
- face-api.js model download (20MB) on slow connections → service worker cache
- Face accuracy varies by demographics → manual merge/split + adjustable threshold
- Safari service worker storage limits → cap offline cache at 500 photos, LRU eviction
