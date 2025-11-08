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
      help_settings: {
        Row: {
          id: string
          youtube_url: string
          image_url: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          youtube_url?: string
          image_url?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          youtube_url?: string
          image_url?: string
          is_active?: boolean
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
      // Added missing tables referenced across the app to fix TS 'never' errors
      theme_settings: {
        Row: {
          id: string
          primary_color: string
          secondary_color: string
          accent_color: string
          background_color: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          background_color?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          background_color?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      hero_settings: {
        Row: {
          id: string
          image_url: string
          storage_path: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          image_url?: string
          storage_path?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          storage_path?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      announcement_settings: {
        Row: {
          id: string
          message: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          message?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          message?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      theme_presets: {
        Row: {
          id: string
          name: string
          primary_color: string
          secondary_color: string
          accent_color: string
          background_color: string
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          primary_color: string
          secondary_color: string
          accent_color: string
          background_color: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          background_color?: string
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      admin_display_settings: {
        Row: {
          id: string
          show_active_meditators: boolean | null
          show_meditation_room: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          show_active_meditators?: boolean | null
          show_meditation_room?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          show_active_meditators?: boolean | null
          show_meditation_room?: boolean | null
          updated_at?: string | null
        }
      }
      admin_credentials: {
        Row: {
          id: string
          email: string
          password_hash: string
          reset_token: string | null
          reset_token_expires: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      good_wishes_videos: {
        Row: {
          id: string
          title: string
          youtube_url: string
          thumbnail_url: string | null
          is_active: boolean
          order_index: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          youtube_url: string
          thumbnail_url?: string | null
          is_active?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          youtube_url?: string
          thumbnail_url?: string | null
          is_active?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          body: string
          audience_type: string
          audience_filter: Json | null
          send_at: string
          repeat_rrule: string | null
          status: string
          channels: Json | null
          sent_at: string | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          body: string
          audience_type?: string
          audience_filter?: Json | null
          send_at: string
          repeat_rrule?: string | null
          status?: string
          channels?: Json | null
          sent_at?: string | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          body?: string
          audience_type?: string
          audience_filter?: Json | null
          send_at?: string
          repeat_rrule?: string | null
          status?: string
          channels?: Json | null
          sent_at?: string | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notification_deliveries: {
        Row: {
          id: string
          notification_id: string
          user_id: string | null
          channel: string
          status: string
          delivered_at: string | null
          read_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          notification_id: string
          user_id?: string | null
          channel: string
          status?: string
          delivered_at?: string | null
          read_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          notification_id?: string
          user_id?: string | null
          channel?: string
          status?: string
          delivered_at?: string | null
          read_at?: string | null
          error_message?: string | null
        }
      }
      notification_dispatch_logs: {
        Row: {
          id: string
          notification_id: string
          dispatch_time: string | null
          status: string | null
          recipients_count: number | null
          error_message: string | null
        }
        Insert: {
          id?: string
          notification_id: string
          dispatch_time?: string | null
          status?: string | null
          recipients_count?: number | null
          error_message?: string | null
        }
        Update: {
          id?: string
          notification_id?: string
          dispatch_time?: string | null
          status?: string | null
          recipients_count?: number | null
          error_message?: string | null
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string
          keys: Json | null
          user_agent: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          endpoint: string
          keys?: Json | null
          user_agent?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          endpoint?: string
          keys?: Json | null
          user_agent?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
