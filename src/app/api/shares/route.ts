import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resourceType, resourceId } = await request.json();

  if (!resourceType || !resourceId) {
    return NextResponse.json({ error: 'resourceType and resourceId are required' }, { status: 400 });
  }

  if (!['photo', 'album', 'video'].includes(resourceType)) {
    return NextResponse.json({ error: 'Invalid resourceType' }, { status: 400 });
  }

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('shares')
    .insert({
      user_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId,
      token,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = new URL(`/share/${token}`, request.url).toString();

  return NextResponse.json({ share: data, url });
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: shares, error } = await supabase
    .from('shares')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const photoIds: string[] = [];
  const albumIds: string[] = [];
  for (const s of shares) {
    if (s.resource_type === 'photo') photoIds.push(s.resource_id);
    else if (s.resource_type === 'album') albumIds.push(s.resource_id);
  }

  let photos: Record<string, unknown> = {};
  let albums: Record<string, unknown> = {};

  if (photoIds.length > 0) {
    const { data: p } = await supabase.from('photos').select('id, original_filename, mime_type, file_size').in('id', photoIds);
    if (p) {
      for (const photo of p) {
        photos[photo.id] = photo;
      }
    }
  }

  if (albumIds.length > 0) {
    const { data: a } = await supabase.from('albums').select('id, title, photo_count').in('id', albumIds);
    if (a) {
      for (const album of a) {
        albums[album.id] = album;
      }
    }
  }

  const enriched = shares.map((s) => ({
    ...s,
    resource: s.resource_type === 'photo' ? photos[s.resource_id] || null : s.resource_type === 'album' ? albums[s.resource_id] || null : null,
  }));

  return NextResponse.json({ shares: enriched });
}
