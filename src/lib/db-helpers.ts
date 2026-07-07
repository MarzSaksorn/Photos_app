import { createServerSupabase } from './supabase-server';

export interface PhotoInsert {
  user_id: string;
  r2_key: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  is_raw?: boolean;
}

export async function insertPhoto(data: PhotoInsert) {
  const supabase = await createServerSupabase();
  const { data: photo, error } = await supabase
    .from('photos')
    .insert({
      user_id: data.user_id,
      r2_key: data.r2_key,
      original_filename: data.original_filename,
      file_size: data.file_size,
      mime_type: data.mime_type,
      is_raw: data.is_raw ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return photo;
}
