export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      album_photos: {
        Row: {
          album_id: string
          photo_id: string
          sort_order: number | null
        }
        Insert: {
          album_id: string
          photo_id: string
          sort_order?: number | null
        }
        Update: {
          album_id?: string
          photo_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_photo_id: string | null
          created_at: string | null
          description: string | null
          id: string
          photo_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_photo_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_photo_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          photo_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_cover_photo_id_fkey"
            columns: ["cover_photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "albums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      face_clusters: {
        Row: {
          cover_photo_id: string | null
          created_at: string | null
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          cover_photo_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          cover_photo_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_clusters_cover_photo_id_fkey"
            columns: ["cover_photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "face_clusters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faces: {
        Row: {
          bounding_box: Json | null
          cluster_id: string | null
          embedding: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          bounding_box?: Json | null
          cluster_id?: string | null
          embedding?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          bounding_box?: Json | null
          cluster_id?: string | null
          embedding?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faces_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "face_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faces_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          crop_data: Json | null
          deleted_at: string | null
          file_size: number
          filters: string | null
          height: number | null
          id: string
          is_raw: boolean | null
          mime_type: string
          original_filename: string
          r2_key: string
          rotation: number | null
          taken_at: string | null
          thumbnail_key: string | null
          uploaded_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          crop_data?: Json | null
          deleted_at?: string | null
          file_size: number
          filters?: string | null
          height?: number | null
          id?: string
          is_raw?: boolean | null
          mime_type: string
          original_filename: string
          r2_key: string
          rotation?: number | null
          taken_at?: string | null
          thumbnail_key?: string | null
          uploaded_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          crop_data?: Json | null
          deleted_at?: string | null
          file_size?: number
          filters?: string | null
          height?: number | null
          id?: string
          is_raw?: boolean | null
          mime_type?: string
          original_filename?: string
          r2_key?: string
          rotation?: number | null
          taken_at?: string | null
          thumbnail_key?: string | null
          uploaded_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          resource_id: string
          resource_type: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          resource_id: string
          resource_type: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          resource_id?: string
          resource_type?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          r2_config: Json | null
          role: string | null
          storage_quota_bytes: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          r2_config?: Json | null
          role?: string | null
          storage_quota_bytes?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          r2_config?: Json | null
          role?: string | null
          storage_quota_bytes?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          duration_secs: number | null
          file_size: number
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          r2_key: string
          taken_at: string | null
          thumbnail_key: string | null
          transcode_status: string | null
          uploaded_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          duration_secs?: number | null
          file_size: number
          height?: number | null
          id?: string
          mime_type: string
          original_filename: string
          r2_key: string
          taken_at?: string | null
          thumbnail_key?: string | null
          transcode_status?: string | null
          uploaded_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          duration_secs?: number | null
          file_size?: number
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          r2_key?: string
          taken_at?: string | null
          thumbnail_key?: string | null
          transcode_status?: string | null
          uploaded_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      decrement_album_photo_count: {
        Args: { album_id: string }
        Returns: undefined
      }
      increment_album_photo_count: {
        Args: { album_id: string }
        Returns: undefined
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
