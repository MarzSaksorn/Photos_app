export interface Photo {
  id: string;
  user_id: string;
  r2_key: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  is_raw: boolean;
  width: number;
  height: number;
  taken_at: string;
  uploaded_at: string;
  deleted_at: string | null;
  crop_data: CropData | null;
  filters: string | null;
  rotation: number | null;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceResult {
  photo_id: string;
  descriptor: Float32Array;
  bounding_box: FaceBox;
  thumbnail?: string;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceGroup {
  id: string;
  user_id: string;
  name: string;
  cover_photo_id: string;
  photo_count: number;
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cover_photo_id: string;
  photo_count: number;
  created_at: string;
}

export interface ScanProgress {
  total: number;
  completed: number;
  facesFound: number;
  status: 'idle' | 'scanning' | 'paused' | 'clustering' | 'done' | 'error';
  currentPhoto: string | null;
}

export interface Share {
  id: string;
  user_id: string;
  resource_type: 'photo' | 'album' | 'video';
  resource_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}
