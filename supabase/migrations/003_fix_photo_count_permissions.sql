-- Fix security: set search_path and restrict execute to authenticated users only

CREATE OR REPLACE FUNCTION public.increment_album_photo_count(album_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.albums SET photo_count = photo_count + 1 WHERE id = album_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_album_photo_count(album_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.albums SET photo_count = GREATEST(photo_count - 1, 0) WHERE id = album_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_album_photo_count(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decrement_album_photo_count(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_album_photo_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_album_photo_count(UUID) TO authenticated;
