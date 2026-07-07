import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import LoginPage from '@/app/login/page';

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LoginPage />;
  }

  const { data: r2Config } = await supabase
    .from('users')
    .select('r2_config')
    .eq('id', user.id)
    .single();

  if (!r2Config?.r2_config) {
    redirect('/settings');
  }

  redirect('/photos');
}
