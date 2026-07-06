import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import LoginPage from '@/app/login/page';

export default async function Home() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <LoginPage />;
  }

  const { data: user } = await supabase
    .from('users')
    .select('r2_config')
    .eq('id', session.user.id)
    .single();

  if (!user?.r2_config) {
    redirect('/settings');
  }

  redirect('/photos');
}
