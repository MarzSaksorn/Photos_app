-- Users table (syncs with Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  r2_config JSONB,
  storage_quota_bytes BIGINT DEFAULT 107374182400,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Photos table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_key TEXT,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  is_raw BOOLEAN DEFAULT FALSE,
  width INT,
  height INT,
  taken_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  crop_data JSONB,
  filters TEXT,
  rotation INT DEFAULT 0
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own photos" ON public.photos
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_photos_user_date ON public.photos (user_id, taken_at DESC);
CREATE INDEX idx_photos_user_uploaded ON public.photos (user_id, uploaded_at DESC);

-- Videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_key TEXT,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  duration_secs REAL,
  width INT,
  height INT,
  taken_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  transcode_status TEXT DEFAULT 'none' CHECK (transcode_status IN ('none', 'pending', 'processing', 'done', 'failed'))
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own videos" ON public.videos
  FOR ALL USING (auth.uid() = user_id);

-- Face clusters
CREATE TABLE public.face_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.face_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own face clusters" ON public.face_clusters
  FOR ALL USING (auth.uid() = user_id);

-- Face embeddings
CREATE TABLE public.faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  embedding extensions.vector(128),
  bounding_box JSONB,
  cluster_id UUID REFERENCES public.face_clusters(id) ON DELETE SET NULL
);

ALTER TABLE public.faces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own faces" ON public.faces
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_faces_user_cluster ON public.faces (user_id, cluster_id);
CREATE INDEX idx_faces_embedding ON public.faces USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- Albums
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own albums" ON public.albums
  FOR ALL USING (auth.uid() = user_id);

-- Album-photo junction
CREATE TABLE public.album_photos (
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (album_id, photo_id)
);

ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own album photos" ON public.album_photos
  FOR ALL USING (
    album_id IN (SELECT id FROM public.albums WHERE user_id = auth.uid())
  );

-- Shares
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('photo', 'album', 'video')),
  resource_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shares by token" ON public.shares
  FOR SELECT USING (true);

CREATE POLICY "Users can CRUD own shares" ON public.shares
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_shares_token ON public.shares (token);

-- App settings
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT USING (true);
