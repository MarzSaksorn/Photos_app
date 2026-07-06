import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PhotoDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (!photo) redirect('/photos');

  return <PhotoDetailClient photo={photo} />;
}
