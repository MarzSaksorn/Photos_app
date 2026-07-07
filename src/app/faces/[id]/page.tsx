import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { FaceGroupDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function FaceGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: group } = await supabase
    .from('face_clusters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!group) redirect('/faces');

  return <FaceGroupDetailClient group={group} />;
}
