import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PhotoDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!photo) redirect('/photos');

  return <PhotoDetailClient photo={photo} />;
}
