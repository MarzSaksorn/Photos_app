import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { isR2Configured, getR2Client, createR2ClientFromConfig, getPresignedDownloadUrl } from '@/lib/r2';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let fullUrl: string;
  try {
    if (isR2Configured()) {
      const client = getR2Client();
      const bucket = process.env.CLOUDFLARE_R2_BUCKET || 'photos';
      fullUrl = await getPresignedDownloadUrl(client, bucket, photo.r2_key, 3600);
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('r2_config')
        .eq('id', user.id)
        .single();
      if (!userData?.r2_config) {
        return NextResponse.json({ error: 'R2 not configured' }, { status: 400 });
      }
      const config = userData.r2_config as { endpoint: string; accessKeyId: string; secretAccessKey: string; bucketName: string };
      const client = createR2ClientFromConfig(config);
      fullUrl = await getPresignedDownloadUrl(client, config.bucketName, photo.r2_key, 3600);
    }
  } catch {
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }

  return NextResponse.json({ photo, fullUrl });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
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
