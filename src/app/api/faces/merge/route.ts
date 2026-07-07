import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sourceId, targetId }: { sourceId: string; targetId: string } = await request.json();

  if (!sourceId || !targetId) {
    return NextResponse.json({ error: 'sourceId and targetId are required' }, { status: 400 });
  }

  if (sourceId === targetId) {
    return NextResponse.json({ error: 'Cannot merge a cluster into itself' }, { status: 400 });
  }

  const { data: clusters, error: fetchError } = await supabase
    .from('face_clusters')
    .select('id')
    .in('id', [sourceId, targetId])
    .eq('user_id', user.id);

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  if (!clusters || clusters.length !== 2) {
    return NextResponse.json({ error: 'One or both clusters not found' }, { status: 404 });
  }

  const { error: moveError } = await supabase
    .from('faces')
    .update({ cluster_id: targetId })
    .eq('cluster_id', sourceId);

  if (moveError) return NextResponse.json({ error: moveError.message }, { status: 500 });

  const { error: deleteError } = await supabase
    .from('face_clusters')
    .delete()
    .eq('id', sourceId)
    .eq('user_id', user.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
