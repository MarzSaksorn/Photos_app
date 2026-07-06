ALTER TABLE public.albums ADD COLUMN photo_count INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_album_photo_count(album_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.albums SET photo_count = photo_count + 1 WHERE id = album_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_album_photo_count(album_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.albums SET photo_count = GREATEST(photo_count - 1, 0) WHERE id = album_id;
END;
$$;
