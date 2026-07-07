import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { getR2Client } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const supabase = await createServerSupabase();

  const { data: share, error } = await supabase
    .from('shares')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 });
  }

  if (new Date(share.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
  }

  const client = getR2Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || 'photos';

  if (share.resource_type === 'photo') {
    const { data: photo } = await supabase
      .from('photos')
      .select('*')
      .eq('id', share.resource_id)
      .is('deleted_at', null)
      .single();

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: photo.r2_key });
    const fullUrl = await getSignedUrl(client, command, { expiresIn: 604800 });

    return NextResponse.json({ share, resource: { ...photo, fullUrl } });
  }

  if (share.resource_type === 'album') {
    const { data: album } = await supabase
      .from('albums')
      .select('*')
      .eq('id', share.resource_id)
      .single();

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const { data: albumPhotos } = await supabase
      .from('album_photos')
      .select('photo_id')
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })
      .limit(20);

    if (!albumPhotos || albumPhotos.length === 0) {
      return NextResponse.json({ share, resource: { ...album, photos: [] } });
    }

    const photoIds = albumPhotos.map((ap) => ap.photo_id);

    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .in('id', photoIds)
      .is('deleted_at', null);

    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const command = new GetObjectCommand({ Bucket: bucket, Key: photo.r2_key });
        const url = await getSignedUrl(client, command, { expiresIn: 604800 });
        return { ...photo, fullUrl: url };
      })
    );

    return NextResponse.json({ share, resource: { ...album, photos: photosWithUrls } });
  }

  return NextResponse.json({ error: 'Unsupported resource type' }, { status: 400 });
}
