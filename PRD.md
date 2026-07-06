# Product Requirements Document: Photos App

**Product Name:** Photos App  
**Status:** Draft  
**Author:** AI  
**Date Created:** 2026-07-06  
**Version:** 1.0  

---

## Executive Summary

**One-liner:** A Google Photos-inspired web app for photo/video backup, organization, and face group recognition using Cloudflare R2 storage.

**Overview:** Users are drowning in phone photos with no good way to back them up, find specific people, or keep their library organized across devices. This app delivers automatic photo/video uploads to Cloudflare R2, AI-powered face grouping (fully client-side, zero server dependencies), and a clean Google Photos-style interface — starting as a PWA with plans for native iOS/Android apps.

**Quick Facts:**
- **Target Users:** Consumer audience, anyone with a phone camera
- **Problem Solved:** No privacy-first, self-hosted alternative to Google Photos with face recognition
- **Key Metric:** Active users uploading photos weekly
- **Platform:** Web (Next.js PWA) → Native iOS & Android

---

## Problem Statement

### The Problem

Google Photos is the de facto standard, but users want privacy, control over their data, and no surprise pricing changes. Existing alternatives lack face recognition or have poor UX.

### Current State

Users either pay Google/iCloud, compromise on privacy, or manage photos manually (USB cables, local folders, scattered across cloud drives). No self-hosted option offers the full Google Photos experience — auto-upload, face grouping, search, and sharing — in a polished package.

### Why Now?

Cloudflare R2 makes S3-compatible object storage affordable with zero egress fees. face-api.js (TensorFlow.js) delivers production-ready face detection and recognition entirely in the browser. Next.js + PWA enables a near-native experience on the web before investing in native apps.

---

## Goals & Objectives

### Business Goals

1. **Provide a privacy-first Google Photos alternative** — users own their data on their R2 bucket
2. **Establish a sustainable revenue model** — either self-hosted (bring your own R2) or SaaS tier
3. **Validate demand before native app investment** — web PWA proves product-market fit

### User Goals

1. Auto-backup photos/videos (including RAW) from phone to cloud
2. Find photos of specific people via face grouping
3. Quickly crop, rotate, or apply filters to photos
4. Watch videos smoothly via transcoded streaming
5. Organize, search, and share their photo library
6. Access everything from any device (web first, native later)

### Non-Goals

- Full photo editing suite (external editors only)
- Multi-user shared libraries
- Public photo sharing / social features
- On-device ML training

---

## User Personas

### Primary Persona: Alex (Privacy-Conscious Photographer)

**Demographics:**
- Age: 25–45
- Tech-savviness: Medium–High
- Takes 50–200 photos/videos per month

**Needs:**
- Automatic backup without trusting Google's data practices
- Find photos of specific people quickly
- Access library from phone, tablet, laptop

**Pain Points:**
- Google Photos compression ruins quality
- iCloud is expensive and Apple-locked
- Self-hosted options (Nextcloud, Photoprism) feel clunky

---

## User Stories & Requirements

### Epic 1: Authentication & Onboarding

#### Story: Sign in with Google

```
As a new user,
I want to sign in with my Google account,
So that I don't need to create yet another account.

Acceptance Criteria:
- [ ] Click "Sign in with Google" redirects to Google OAuth
- [ ] First-time user is prompted to connect their R2 bucket (mandatory before use)
- [ ] Returning user lands directly on the photo grid
- [ ] Session persists across browser tabs
- [ ] Logout clears local session but preserves cached thumbnails
```

**Priority:** P0  
**Effort:** M

#### Story: R2 Bucket Configuration

```
As a user,
I want to connect my Cloudflare R2 bucket or use a hosted one,
So that my photos are stored under my control.

Acceptance Criteria:
- [ ] User must provide R2 endpoint, access key ID, secret access key, and bucket name
- [ ] Connection test button validates credentials before saving
- [ ] Encrypted storage of credentials at rest (AES-256)
- [ ] No hosted/default R2 option — user's own bucket is required
```

**Priority:** P0  
**Effort:** L

---

### Epic 2: Photo/Video Upload & Backup

#### Story: Auto-backup from device

```
As a user,
I want photos/videos from my device to automatically upload,
So that my library is always backed up without manual effort.

Acceptance Criteria:
- [ ] Upload via drag-and-drop on desktop
- [ ] Mobile: file picker with multi-select (PWA)
- [ ] Background upload with progress indicators
- [ ] Presigned URL generation → direct upload to R2
- [ ] Handle network interruptions — retry with exponential backoff
- [ ] Deduplication by file hash (skip already-uploaded files)
- [ ] Preserve original EXIF data and quality
- [ ] Support HEIC/HEIF, JPEG, PNG, MP4, MOV (common formats)
```

**Priority:** P0  
**Effort:** L

---

### Epic 3: Photo Library (Google Photos-style Grid)

#### Story: Timeline view

```
As a user,
I want to see my photos organized chronologically,
So that I can browse my library naturally by date.

Acceptance Criteria:
- [ ] Virtualized grid with infinite scroll (descending by date)
- [ ] Date headers separating sections (Today, Yesterday, July 2026, etc.)
- [ ] Thumbnails loaded progressively (blur-up or skeleton)
- [ ] Tap/click photo opens detail view
- [ ] Pull-to-refresh for new uploads (mobile)
- [ ] Smooth 60fps scroll on mobile web
```

**Priority:** P0  
**Effort:** M

#### Story: Search

```
As a user,
I want to search my photos by date, people, or text in the filename,
So that I can find specific photos quickly.

Acceptance Criteria:
- [ ] Search bar with autocomplete
- [ ] Search by: date range, person name, file type (video/photo)
- [ ] Results update in real-time as user types (debounced)
- [ ] Empty state: "No results found" with suggestions
```

**Priority:** P1  
**Effort:** M

---

### Epic 4: Face Group Recognition

#### Story: Automatic face grouping

```
As a user,
I want photos of the same person to be automatically grouped,
So that I can find all photos of my family members in one place.

Acceptance Criteria:
- [ ] "Scan faces" button triggers batch processing (or auto-run after upload)
- [ ] Videos are skipped (face processing runs on images only)
- [ ] face-api.js runs in a Web Worker (non-blocking)
- [ ] Progress bar shows: current photo / total, faces found, ETA
- [ ] 128-d face descriptors computed in-browser via TensorFlow.js WebGL backend
- [ ] Results persisted in IndexedDB per-photo (resumable on refresh)
- [ ] DBSCAN clustering runs locally once all photos are processed
- [ ] Clusters synced to server: face groups stored in Postgres, descriptors in pgvector
- [ ] User can name/rename face groups ("Mom", "Dad", etc.)
- [ ] Face group page: grid of photos containing that person
- [ ] New uploads detected and matched against existing clusters on-the-fly
- [ ] Confidence threshold adjustable (slider in settings)
```

**Priority:** P0  
**Effort:** XL

#### Story: Merge/split face groups

```
As a user,
I want to merge two face groups or split misidentified ones,
So that I can correct the AI when it makes mistakes.

Acceptance Criteria:
- [ ] Long-press / context menu on face group → "Merge with..."
- [ ] Select which face groups to merge
- [ ] Split: select individual photos within a group → "Move to new group"
- [ ] Changes propagate to search results immediately
```

**Priority:** P1  
**Effort:** S

---

### Epic 5: Albums & Organization

#### Story: Create and manage albums

```
As a user,
I want to create albums and add photos to them,
So that I can organize my library into collections (trips, events, etc.).

Acceptance Criteria:
- [ ] Create album: title, optional description, cover photo
- [ ] Add photos: multi-select from grid
- [ ] Reorder photos within album (drag-and-drop)
- [ ] Album grid view: cover photo + photo count
- [ ] Share album as a link (P2)
```

**Priority:** P1  
**Effort:** M

---

### Epic 6: Photo Editing (Crop, Rotate, Filters)

#### Story: Basic photo editing

```
As a user,
I want to crop, rotate, and apply filters to my photos,
So that I can make quick adjustments without leaving the app.

Acceptance Criteria:
- [ ] Crop: drag handles, fixed aspect ratios (1:1, 4:3, 16:9, free)
- [ ] Rotate: 90° left/right, flip horizontal/vertical
- [ ] Filters: 5-8 preset filters (vintage, b&w, warm, cool, etc.) via CSS/canvas
- [ ] Non-destructive editing — original is preserved, edit stored as metadata
- [ ] "Open in external editor" button passes the original to default system app
- [ ] Revert to original at any time
```

**Priority:** P1  
**Effort:** M

---

### Epic 7: Video Transcoding (Phase 2)

#### Story: Video playback (Phase 1 — direct download)

```
As a user,
I want to watch my uploaded videos,
So that I can view them without downloading third-party software.

Acceptance Criteria:
- [ ] Videos (MP4, MOV) play inline in the browser
- [ ] HTML5 video player with play/pause, seek, volume controls
- [ ] Thumbnail generated from video midpoint (on upload via ffmpeg.wasm or server)
- [ ] Large videos show download option if browser can't play them natively
```

**Priority:** P1  
**Effort:** S

---

#### Story: Transcode uploaded videos for streaming (Phase 2)

```
As a user,
I want videos to play smoothly in the browser,
So that I don't have to download the full file to watch.

Acceptance Criteria:
- [ ] On upload, video queued for transcoding (separate worker)
- [ ] Transcode to HLS (m3u8 + TS segments) for adaptive bitrate
- [ ] Thumbnail generated from video midpoint
- [ ] Progress shown in photo grid (badge: "Processing...")
- [ ] Original quality preserved in R2, transcoded copy stored alongside
```

**Priority:** P2 (Phase 2)

---

### Epic 8: Multi-User Management (Admin)

#### Story: Admin user management via Supabase

```
As an admin,
I want to manage users, storage quotas, and settings,
So that multiple people can use the app with proper controls.

Acceptance Criteria:
- [ ] Admin panel accessible to designated admin users
- [ ] View all registered users (email, signup date, storage used, last login)
- [ ] Assign storage quotas per user (GB limit)
- [ ] Suspend/activate user accounts
- [ ] Global app settings (max upload size, allowed file types, face confidence threshold)
- [ ] Storage usage dashboard (total, per-user, R2 bucket metrics)
```

**Priority:** P1  
**Effort:** M

---

### Epic 9: Sharing

#### Story: Share individual photo or album

```
As a user,
I want to share a photo or album via a link,
So that friends and family can view it without an account.

Acceptance Criteria:
- [ ] Generate shareable link (signed URL with expiry)
- [ ] Viewer gets a clean page showing the photo/album
- [ ] Option to require a password
- [ ] Revoke link anytime
```

**Priority:** P2  
**Effort:** M

---

### Epic 10: Native Apps (Phase 2)

#### Story: Native iOS app

```
As an iOS user,
I want a native iOS app with background upload,
So that photos back up automatically from my camera roll.

Acceptance Criteria:
- [ ] PHPhotoLibrary permission flow
- [ ] Background upload via BGTaskScheduler
- [ ] Native share sheet integration
- [ ] Widget: "Last 5 photos" on home screen
```

**Priority:** P2 (Phase 2)  
**Effort:** XL

#### Story: Native Android app

```
As an Android user,
I want a native Android app with background upload,
So that photos back up automatically from my gallery.

Acceptance Criteria:
- [ ] MediaStore permission flow
- [ ] WorkManager for background sync
- [ ] Notification channel for upload progress
- [ ] Share sheet integration
```

**Priority:** P2 (Phase 2)  
**Effort:** XL

---

### Functional Requirements Matrix

| Req ID | Description | Priority | Phase |
|--------|-------------|----------|-------|
| FR-001 | Google OAuth authentication | P0 | 1 |
| FR-002 | R2 bucket configuration (custom or hosted) | P0 | 1 |
| FR-003 | Direct-to-R2 upload via presigned URLs | P0 | 1 |
| FR-004 | RAW photo support (CR2, NEF, ARW, DNG, RAF, ORF, RW2, etc.) | P0 | 1 |
| FR-005 | Chronological photo grid (infinite scroll) | P0 | 1 |
| FR-006 | Face detection + recognition (client-side Web Worker) | P0 | 1 |
| FR-007 | Face group naming, merging, splitting | P0 | 1 |
| FR-008 | Photo detail view (full resolution, EXIF) | P0 | 1 |
| FR-009 | Basic editing: crop, rotate, filters | P1 | 1 |
| FR-010 | Search by date and person | P1 | 1 |
| FR-011 | Album CRUD | P1 | 1 |
| FR-012 | Video transcoding for streaming (HLS) | P1 | 2 |
| FR-013 | Multi-user admin panel (Supabase) | P1 | 1 |
| FR-014 | Shareable links with expiry | P2 | 1 |
| FR-015 | Password-protected shares | P2 | 2 |
| FR-016 | Native iOS app with background upload | P2 | 2 |
| FR-017 | Native Android app with background upload | P2 | 2 |

### Non-Functional Requirements

| Req ID | Category | Description | Target |
|--------|----------|-------------|--------|
| NFR-001 | Performance | Initial page load (LCP) | < 2s |
| NFR-002 | Performance | Thumbnail grid scroll | 60fps |
| NFR-003 | Storage | Upload limit (photos) | 200MB per file (RAW support, configurable) |
| NFR-003b | Storage | Upload limit (videos) | 2GB per file (configurable) |
| NFR-004 | Security | R2 credentials at rest | AES-256 encrypted |
| NFR-005 | Security | Photo access | Auth-required for all routes |
| NFR-006 | Offline | PWA service worker cache | Thumbnails + metadata available offline |
| NFR-007 | Scalability | Face embedding search | < 200ms for 1M faces |

---

## Success Metrics

### Primary Metric (North Star)

**Metric:** Weekly Active Uploaders (WAU)  
**Definition:** Users who upload at least one photo in a 7-day window  
**Target:** 80% of signed-up users uploading weekly  

### Secondary Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Photos uploaded per user (monthly) | 50+ | Month 3 |
| Face groups created per 1000 photos | 5+ | Month 1 |
| Search usage (% of sessions) | 30%+ | Month 3 |
| PWA install rate | 15%+ | Month 3 |
| App Store / Play Store conversion (Phase 2) | 10% of web users | Month 6 |

---

## Scope

### Phase 1 (MVP — Web PWA)

- Google OAuth + Supabase user management
- R2 storage integration (user must provide their own bucket)
- RAW photo support (CR2, NEF, ARW, DNG, RAF, ORF, RW2 + any camera RAW via libraw)
- Direct upload via presigned URLs
- Chronological photo grid (infinite scroll)
- Photo detail view with EXIF
- Basic editing: crop, rotate, filters
- Client-side face detection + recognition (face-api.js in Web Worker)
- Face group browsing, naming, merge/split
- Embedded video playback (MP4, MOV — direct download, no transcoding)
- Search by date and person
- Albums (CRUD)
- Shareable photo links (no auth required to view)
- PWA support (service worker, manifest, offline thumbnails)

### Phase 2

- Native iOS app (background upload, share sheet, widgets)
- Native Android app (WorkManager, notifications)
- Password-protected shares
- Video transcoding for streaming (HLS/DASH)
- Admin panel: user management, storage quotas
- "Open in external editor" flow

### Out of Scope

- Full photo editing suite (external editors handle advanced edits)
- Multi-user / family shared libraries
- Public photo feeds / social features
- On-device ML model training
- Automatic album suggestions
- Memories / "On this day" feature
- Photo book printing / merchandise

---

## Technical Considerations

### High-Level Architecture

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
[Supabase / Postgres + pgvector]   ←  Face group metadata, descriptors, albums, users
    ↕
[Cloudflare R2]                     ←  Original photos, videos, thumbnails
```

**Note:** All face detection and recognition runs in the browser via Web Worker. The server stores face descriptors and handles clustering + search queries, but never processes images.

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- face-api.js (client-side face detection + recognition via TensorFlow.js, Web Worker)
- @tanstack/react-query (data fetching)
- react-photo-view (lightbox)
- Workbox (service worker / PWA)
- idb (IndexedDB wrapper for progress persistence)

**Backend:**
- Next.js API Routes + Server Actions
- Supabase (Postgres + pgvector + Auth + Realtime)
- Prisma / Drizzle ORM

**Infrastructure:**
- Vercel (Next.js hosting)
- Supabase (managed Postgres + auth)
- Cloudflare R2 (object storage)
- Cloudflare Images (optional: thumbnail transforms)
- FFmpeg worker (Phase 2 — Railway / Fly.io for video transcoding)

### Face Recognition Pipeline (Fully Client-Side)

```
1. Photos uploaded to R2 → metadata stored in Postgres
2. User triggers "Scan faces" or it runs automatically after upload batch
3. Web Worker wakes up, loads face-api.js models (1-time ~20MB download)
4. Process photos in batches of 10, yielding to UI between batches:
   a. Fetch thumbnail from R2 (low-res, fast download)
   b. Detect faces via face-api.js (SSD Mobilenet v1)
   c. For each face: compute 128-d descriptor (Face Landmarks 68)
   d. Store result in IndexedDB: photo_id, descriptor, bounding_box, thumbnail
5. Progress saved to IndexedDB after each photo (resumable)
6. Status bar updates reactively: "342 / 5,241 photos | 12 faces found"
7. After all photos processed → local clustering:
   a. Cosine similarity matrix of all descriptors
   b. DBSCAN clustering (epsilon=0.5, min_samples=2)
   c. Generate face groups
8. Results synced to server: face group metadata + descriptors stored in pgvector
9. New uploads: run detection only on the new photo, match against existing clusters
```

**Non-blocking guarantees:**
- Web Worker runs on a separate thread — UI stays at 60fps
- 10-photo batches with 50ms `setTimeout` yields between batches
- GPU via WebGL backend: ~200–500ms per face on modern hardware
- 5,000 photos with ~1.5 avg faces → ~15–30 min total, browser remains usable
- tab unload / refresh: progress persists in IndexedDB, resumes from last processed photo

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/init` | Generate presigned upload URL for R2 |
| POST | `/api/upload/complete` | Callback after R2 upload finishes |
| GET | `/api/photos` | Paginated photo list (cursor-based) |
| GET | `/api/photos/[id]` | Photo detail + presigned view URL |
| DELETE | `/api/photos/[id]` | Soft-delete photo |
| GET | `/api/faces` | Face groups list with cover faces |
| GET | `/api/faces/[id]/photos` | Photos in a face group |
| PUT | `/api/faces/merge` | Merge face groups |
| PUT | `/api/faces/[id]/rename` | Name a face group |
| GET | `/api/search?q=` | Search by date/person/text |
| POST | `/api/albums` | Create album |
| GET | `/api/albums` | List albums |
| GET | `/api/albums/[id]` | Album detail + photos |
| PUT | `/api/albums/[id]` | Update album |
| DELETE | `/api/albums/[id]` | Delete album |
| POST | `/api/shares` | Create shareable link |
| GET | `/api/shares/[token]` | Access shared content (no auth) |
| POST | `/api/videos/transcode` | Trigger transcode for a video |
| GET | `/api/videos/[id]/status` | Check transcoding status |
| GET | `/api/admin/users` | List all users (admin) |
| PUT | `/api/admin/users/[id]` | Update user quota / status (admin) |
| GET | `/api/admin/stats` | Storage and usage stats (admin) |

### Data Model (Key Entities)

**User:** id, email, name, avatar_url, r2_config (encrypted JSON), created_at  
**User:** id, email, name, avatar_url, r2_config (encrypted JSON), storage_quota_bytes, role (user | admin), created_at  
**Photo:** id, user_id, r2_key, original_filename, file_size, mime_type, is_raw (boolean), width, height, taken_at (from EXIF), uploaded_at, deleted_at, crop_data (JSON), filters (JSON), rotation (int)  
**Video:** id, user_id, r2_key, original_filename, file_size, mime_type, duration_secs, width, height, taken_at, uploaded_at, transcode_status (pending | processing | done | failed), hls_playlist_key  
**Face:** id, photo_id, embedding (vector(128)), bounding_box (JSON), cluster_id  
**FaceCluster:** id, user_id, name, cover_face_id  
**Album:** id, user_id, title, description, cover_photo_id, created_at, updated_at  
**AlbumPhoto:** album_id, photo_id, sort_order  
**Share:** id, user_id, resource_type (photo | album | video), resource_id, token, password_hash, expires_at  
**AppSetting:** id, key, value (JSON), updated_at  

### Security

- **Auth:** Supabase + Google OAuth
- **Storage:** Presigned URLs with 15-minute expiry for uploads; 1-hour expiry for view URLs
- **Face data:** Embeddings stored encrypted at rest; no raw face images retained server-side beyond thumbnails
- **Rate limiting:** 100 uploads/hour per user; 1000 search queries/hour
- **CORS:** Restricted to the app domain

### Performance Targets

| Metric | Target |
|--------|--------|
| Photo grid initial load | < 2s (30 photos) |
| Infinite scroll append | < 200ms |
| Face per-photo processing (GPU) | 200–500ms |
| 5,000 photo batch processing | ~15–30 min (resumable, non-blocking) |
| Face search (1M vectors on server) | < 200ms |
| Upload (10MB) | < 5s (depends on user's internet) |

### Offline Strategy (PWA)

- Service worker caches photo metadata + thumbnails (last 500 photos)
- IndexedDB stores pending upload queue
- Background Sync API retries failed uploads on reconnect
- Full-resolution photos require online (streamed from R2)

---

## Design & UX Requirements

### UX Principles

- **Zero learning curve** — familiar to Google Photos users
- **Thumbnail-first** — photos are the interface
- **Fast by default** — skeleton loaders, progressive images, instant transitions
- **Mobile-first responsive** — works beautifully on phone screens first
- **Transparent progress** — face scanning shows a persistent status bar: "Scanning faces: 342 / 5,241 · 12 faces found · 3m remaining"
- **Resumable** — leave the page, come back, processing picks up where it left off

### Key Screens

**1. Photo Grid (Timeline)**
- Full-bleed thumbnails, variable width by aspect ratio (Pinterest-style masonry or uniform grid)
- Date headers (sticky)
- FAB: upload button (mobile)
- Search bar at top

**2. Photo Detail**
- Full-resolution image with pinch-to-zoom
- EXIF overlay: date, location, camera, file size
- Action bar: share, delete, add to album, download
- Face tags below photo (tappable → face group)
- Swipe left/right to navigate adjacent photos

**3. Face Scanning Progress**
- Persistent status bar at top of photo grid (dismissible)
- Shows: `[=====>--------] 342 / 5,241 photos · 12 faces found · ~3m remaining`
- Pause/Resume button
- Tapping opens full progress view: per-batch stats, recently scanned faces preview
- Hidden when processing is complete or paused for > 24h

**4. Face Groups**
- Grid of face group cards: cluster cover photo + person name + photo count
- Tap → grid of all photos containing that person
- Context menu: rename, merge, split

**5. Albums**
- List/grid of albums with cover photo, title, count
- Album detail: photo grid within album, add/remove photos
- Drag to reorder

**6. Search**
- Full-screen search overlay
- Suggestions: recent searches, face group names, date ranges
- Results grouped by type (photos, people, albums)

**7. Share View**
- Clean, minimal page (no auth required)
- Photo or album display with optional password prompt
- Download button for individual photos

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px (mobile) | 2-column grid, bottom nav bar |
| 640–1024px (tablet) | 3-column grid, sidebar collapsed |
| 1024px+ (desktop) | 4+ column grid, persistent sidebar |

### Accessibility

- WCAG 2.1 AA
- Keyboard navigation (arrow keys through grid, Enter to open)
- Alt text from filename + date (configurable)
- High contrast mode support
- Focus indicators on all interactive elements

---

## Timeline & Milestones

### Phases

| Phase | Deliverables | Duration |
|-------|-------------|----------|
| **Discovery** | PRD finalized, tech design doc, R2 integration proof-of-concept | 2 weeks |
| **Sprint 1** | Auth, R2 upload, photo grid, photo detail | 3 weeks |
| **Sprint 2** | Face detection pipeline (Web Worker), progress bar, IndexedDB persistence, face groups, clustering | 3 weeks |
| **Sprint 3** | Albums, search, PWA offline support | 2 weeks |
| **Sprint 4** | Sharing, polish, beta testing | 2 weeks |
| **Launch** | Production release, monitoring | 1 week |
| **Phase 2** | Native iOS app development | 8–10 weeks |
| **Phase 2** | Native Android app development | 8–10 weeks |

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Face recognition accuracy low for certain demographics | Medium | Medium | Allow manual merge/split; adjustable confidence threshold |
| Browser tab closed mid-processing | Medium | High | Progress persisted in IndexedDB per-photo; resume on next visit |
| face-api.js model download (20MB) on slow connections | Low | Medium | Show loading progress; cache in service worker; models preloaded after auth |
| R2 egress costs for shared links | Low | Medium | Signed URLs with expiry; cache on Cloudflare CDN |
| PWA performance on older mobile devices | Medium | Medium | Lazy loading; low-res thumbnails for older devices |
| Service worker storage limits (Safari) | Medium | High | Cap offline cache at 500 photos; clear LRU |
| Supabase pgvector performance at scale | Medium | Low | Index embeddings with IVFFlat; consider dedicated pgvector instance |
| Google OAuth rate limits | Low | Low | Implement session refresh tokens; offline fallback |

---

## Dependencies & Assumptions

### Dependencies

- [ ] Cloudflare R2 bucket provisioned
- [ ] Supabase project created (Postgres + Auth + pgvector extension)
- [ ] Vercel project configured
- [ ] Google Cloud Console OAuth credentials created

### Assumptions

- Users have modern browsers (Chrome, Safari, Firefox, Edge — last 2 versions)
- Average user uploads < 5000 photos in first 3 months
- Face recognition is a "best effort" feature — manual corrections expected
- Users have or are willing to create a Cloudflare R2 bucket

---

## Resolved Questions

- [x] **Face clustering runs in the browser** — Client-side DBSCAN in Web Worker with progress bar. Slower but avoids server dependencies and fits Vercel deployment.
- [x] **R2 permissions documented** — Provide users with a setup guide listing required R2 token permissions: `Workers R2 Storage Bucket` scope with `ObjectRead` and `ObjectWrite`.
- [x] **face-api.js models via CDN** — Lazy-loaded and cached by the service worker. Not bundled.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-06 | AI | Initial draft |
