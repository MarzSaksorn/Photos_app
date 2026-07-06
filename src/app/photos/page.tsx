import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PhotoGrid } from '@/components/photo-grid';
import { UploadButton } from '@/components/upload-button';

export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen">
      <PhotoGrid />
      <UploadButton />
    </div>
  );
}
