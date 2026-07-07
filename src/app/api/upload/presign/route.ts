import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { isR2Configured, createR2ClientFromConfig, getPresignedUploadUrl, getPresignedUploadUrlWithClient } from '@/lib/r2';
import { insertPhoto } from '@/lib/db-helpers';
import type { R2Config } from '@/types';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { filename, contentType, fileSize } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
  }

  const key = `users/${user.id}/${Date.now()}-${filename}`;
  const isRaw = /\.(cr2|nef|arw|dng|raf|orf|rw2|raw)$/i.test(filename);

  // Try env vars first, fall back to DB config
  let url: string;
  if (isR2Configured()) {
    try {
      const result = await getPresignedUploadUrl(
        process.env.CLOUDFLARE_R2_BUCKET || 'photos',
        key,
        contentType
      );
      url = result.url;
    } catch {
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
  } else {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('r2_config')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.r2_config) {
      return NextResponse.json({ error: 'R2 storage is not configured. Set environment variables or save R2 config in settings.' }, { status: 400 });
    }

    const config = userData.r2_config as R2Config;
    const client = createR2ClientFromConfig(config);

    try {
      const result = await getPresignedUploadUrlWithClient(client, config.bucketName, key, contentType);
      url = result.url;
    } catch {
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
  }

  let photoId: string;
  try {
    const photo = await insertPhoto({
      user_id: user.id,
      r2_key: key,
      original_filename: filename,
      file_size: fileSize || 0,
      mime_type: contentType,
      is_raw: isRaw,
    });
    photoId = photo.id;
  } catch {
    return NextResponse.json({ error: 'Failed to record photo' }, { status: 500 });
  }

  return NextResponse.json({ url, key, photoId });
}
