import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', user.id)
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
