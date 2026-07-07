import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: clusters } = await supabase
    .from('face_clusters')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at');

  const clustersWithCount = await Promise.all(
    (clusters || []).map(async (cluster) => {
      const { count } = await supabase
        .from('faces')
        .select('*', { count: 'exact', head: true })
        .eq('cluster_id', cluster.id);
      return { ...cluster, photo_count: count || 0 };
    })
  );

  return NextResponse.json({ faceGroups: clustersWithCount });
}
