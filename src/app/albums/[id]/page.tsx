import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: album } = await supabase
    .from('albums')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (!album) redirect('/albums');

  return <AlbumDetailClient album={album} />;
}
