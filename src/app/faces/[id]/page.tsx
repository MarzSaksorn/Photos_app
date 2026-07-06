import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { FaceGroupDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function FaceGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: group } = await supabase
    .from('face_clusters')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (!group) redirect('/faces');

  return <FaceGroupDetailClient group={group} />;
}
