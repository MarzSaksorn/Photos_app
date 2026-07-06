import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlbumGrid } from '@/components/album-grid';

export const dynamic = 'force-dynamic';

export default async function AlbumsPage() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Albums</h1>
      </div>
      <AlbumGrid />
    </div>
  );
}
