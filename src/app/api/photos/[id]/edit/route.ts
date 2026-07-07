import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { crop, rotation, filter } = await request.json();

  const { error } = await supabase
    .from('photos')
    .update({
      crop_data: crop,
      rotation: rotation ?? 0,
      filters: filter,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
