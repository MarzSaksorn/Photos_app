import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { getR2Client } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const client = getR2Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || 'photos';
  const command = new GetObjectCommand({ Bucket: bucket, Key: photo.r2_key });
  const fullUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return NextResponse.json({ photo, fullUrl });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('photos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
