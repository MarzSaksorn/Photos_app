import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .ilike('original_filename', `%${q}%`)
    .limit(20);

  const { data: faceGroups } = await supabase
    .from('face_clusters')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', `%${q}%`)
    .limit(10);

  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', user.id)
    .ilike('title', `%${q}%`)
    .limit(10);

  return NextResponse.json({ photos, faceGroups, albums });
}
