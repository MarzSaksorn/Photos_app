import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

interface ClusterInput {
  clusterId: number;
  photoIds: string[];
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clusters }: { clusters: ClusterInput[] } = await request.json();

  for (const cluster of clusters) {
    const { data: faceCluster, error: clusterError } = await supabase
      .from('face_clusters')
      .insert({
        user_id: user.id,
        name: `Person ${cluster.clusterId + 1}`,
        cover_photo_id: cluster.photoIds[0],
      })
      .select()
      .single();

    if (clusterError || !faceCluster) continue;
  }

  return NextResponse.json({ ok: true });
}
