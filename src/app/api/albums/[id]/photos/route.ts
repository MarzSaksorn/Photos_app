import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

  const { data: albumPhotos } = await supabase
    .from('album_photos')
    .select('photo_id')
    .eq('album_id', id);

  const photoIds = (albumPhotos || []).map((ap) => ap.photo_id);
  if (photoIds.length === 0) {
    return NextResponse.json({ photos: [], nextCursor: null });
  }

  let query = supabase
    .from('photos')
    .select('*')
    .in('id', photoIds)
    .is('deleted_at', null)
    .order('taken_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('taken_at', cursor);
  }

  const { data: photos, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hasMore = photos.length > limit;
  const items = hasMore ? photos.slice(0, limit) : photos;
  const nextCursor = hasMore ? items[items.length - 1].taken_at : null;

  return NextResponse.json({ photos: items, nextCursor });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { photoId } = await request.json();
  if (!photoId) {
    return NextResponse.json({ error: 'photoId is required' }, { status: 400 });
  }

  const { error: insertError } = await supabase
    .from('album_photos')
    .insert({ album_id: id, photo_id: photoId });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await supabase.rpc('increment_album_photo_count', { album_id: id });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { photoId } = await request.json();
  if (!photoId) {
    return NextResponse.json({ error: 'photoId is required' }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('album_photos')
    .delete()
    .eq('album_id', id)
    .eq('photo_id', photoId);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  await supabase.rpc('decrement_album_photo_count', { album_id: id });

  return NextResponse.json({ ok: true });
}
