export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      meditation_sessions: {
        Row: {
          id: string
          name: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          start_time: string | null
          end_time: string | null
          duration_seconds: number | null
          is_active: boolean | null
          created_at: string | null
          last_heartbeat: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string | null
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean | null
          created_at?: string | null
          last_heartbeat?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string | null
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean | null
          created_at?: string | null
          last_heartbeat?: string | null
          user_id?: string | null
        }
      }
      daily_meditation_totals: {
        Row: {
          id: string
          date: string
          total_seconds: number
          session_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          total_seconds?: number
          session_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          total_seconds?: number
          session_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          text: string
          author: string
          language: string
          is_active: boolean
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          text: string
          author: string
          language?: string
          is_active?: boolean
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          text?: string
          author?: string
          language?: string
          is_active?: boolean
          created_at?: string | null
          created_by?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          language: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          language?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          language?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          mobile_e164: string | null
          name: string
          bk_centre_name: string
          email: string | null
          google_id: string | null
          is_admin: boolean | null
          created_at: string | null
          last_login: string | null
          updated_at: string | null
          location_consent_given: boolean | null
          location_permission_status: string | null
          location_consent_date: string | null
          latitude: number | null
          longitude: number | null
          location_source: string | null
          location_accuracy: number | null
          location_updated_at: string | null
          country: string | null
          country_code: string | null
          state: string | null
          state_code: string | null
          district: string | null
          city_town: string | null
          address_source: string | null
          address_updated_at: string | null
        }
        Insert: {
          id?: string
          mobile_e164?: string | null
          name: string
          bk_centre_name: string
          email?: string | null
          google_id?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          last_login?: string | null
          updated_at?: string | null
          location_consent_given?: boolean | null
          location_permission_status?: string | null
          location_consent_date?: string | null
          latitude?: number | null
          longitude?: number | null
          location_source?: string | null
          location_accuracy?: number | null
          location_updated_at?: string | null
          country?: string | null
          country_code?: string | null
          state?: string | null
          state_code?: string | null
          district?: string | null
          city_town?: string | null
          address_source?: string | null
          address_updated_at?: string | null
        }
        Update: {
          id?: string
          mobile_e164?: string | null
          name?: string
          bk_centre_name?: string
          email?: string | null
          google_id?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          last_login?: string | null
          updated_at?: string | null
          location_consent_given?: boolean | null
          location_permission_status?: string | null
          location_consent_date?: string | null
          latitude?: number | null
          longitude?: number | null
          location_source?: string | null
          location_accuracy?: number | null
          location_updated_at?: string | null
          country?: string | null
          country_code?: string | null
          state?: string | null
          state_code?: string | null
          district?: string | null
          city_town?: string | null
          address_source?: string | null
          address_updated_at?: string | null
        }
      }
      meditation_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meditation_room_videos: {
        Row: {
          id: string
          room_id: string
          title: string
          youtube_url: string
          display_order: number
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          title: string
          youtube_url: string
          display_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          title?: string
          youtube_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meditation_room_sessions: {
        Row: {
          id: string
          video_id: string
          user_id: string | null
          name: string
          location: string | null
          latitude: number | null
          longitude: number | null
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          is_active: boolean
          last_heartbeat: string
          created_at: string | null
        }
        Insert: {
          id?: string
          video_id: string
          user_id?: string | null
          name: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean
          last_heartbeat?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string | null
          name?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean
          last_heartbeat?: string
          created_at?: string | null
        }
      }
      countries: {
        Row: {
          id: string
          name: string
          code: string
          dial_code: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          dial_code: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          dial_code?: string
          created_at?: string | null
        }
      }
      states: {
        Row: {
          id: string
          country_id: string
          name: string
          code: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          country_id: string
          name: string
          code?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          country_id?: string
          name?: string
          code?: string | null
          created_at?: string | null
        }
      }
      cities: {
        Row: {
          id: string
          state_id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          state_id: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          state_id?: string
          name?: string
          created_at?: string | null
        }
      }
    }
  }
}
