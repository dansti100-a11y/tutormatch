// Hand-written schema types for TutorMatch.
// Regenerate once you have a Supabase project:
//   npx supabase gen types typescript --project-id <id> > lib/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'student' | 'tutor' | 'admin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string
          role: 'student' | 'tutor' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'student' | 'tutor' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tutor_profiles: {
        Row: {
          id: string
          user_id: string
          scores_json: Json
          subjects: string[]
          bio_prompt: string
          availability: Json
          verified: boolean
          screenshot_path: string | null
          rating_avg: number
          sessions_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scores_json?: Json
          subjects?: string[]
          bio_prompt?: string
          availability?: Json
          verified?: boolean
          screenshot_path?: string | null
          rating_avg?: number
          sessions_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scores_json?: Json
          subjects?: string[]
          bio_prompt?: string
          availability?: Json
          verified?: boolean
          screenshot_path?: string | null
          rating_avg?: number
          sessions_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tutor_apps: {
        Row: {
          id: string
          applicant_name: string
          applicant_email: string
          scores_json: Json
          subjects: string[]
          bio: string
          availability: Json
          screenshot_path: string | null
          status: 'pending' | 'approved' | 'rejected'
          admin_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          applicant_name: string
          applicant_email: string
          scores_json?: Json
          subjects?: string[]
          bio?: string
          availability?: Json
          screenshot_path?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          admin_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          applicant_name?: string
          applicant_email?: string
          scores_json?: Json
          subjects?: string[]
          bio?: string
          availability?: Json
          screenshot_path?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          admin_note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          grade: number | null
          target_test: 'SAT' | 'ACT' | 'both' | null
          weak_subjects: string[]
          current_score: number | null
          goal_score: number | null
          availability: Json
          preferred_format: 'in-person' | 'virtual' | 'either' | null
          style_tags: string[]
          onboarding_done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grade?: number | null
          target_test?: 'SAT' | 'ACT' | 'both' | null
          weak_subjects?: string[]
          current_score?: number | null
          goal_score?: number | null
          availability?: Json
          preferred_format?: 'in-person' | 'virtual' | 'either' | null
          style_tags?: string[]
          onboarding_done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grade?: number | null
          target_test?: 'SAT' | 'ACT' | 'both' | null
          weak_subjects?: string[]
          current_score?: number | null
          goal_score?: number | null
          availability?: Json
          preferred_format?: 'in-person' | 'virtual' | 'either' | null
          style_tags?: string[]
          onboarding_done?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'student_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      session_requests: {
        Row: {
          id: string
          student_id: string
          tutor_id: string
          subject: string
          time_options: Json
          format: 'in-person' | 'virtual'
          note: string | null
          status: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'
          counter_times: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          tutor_id: string
          subject: string
          time_options?: Json
          format: 'in-person' | 'virtual'
          note?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'
          counter_times?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          tutor_id?: string
          subject?: string
          time_options?: Json
          format?: 'in-person' | 'virtual'
          note?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'
          counter_times?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_requests_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_requests_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          request_id: string | null
          student_id: string
          tutor_id: string
          subject: string
          scheduled_at: string
          format: 'in-person' | 'virtual'
          location_or_link: string | null
          status: 'confirmed' | 'completed' | 'cancelled'
          rate: number | null
          reminder_sent: boolean
          review_prompted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          student_id: string
          tutor_id: string
          subject: string
          scheduled_at: string
          format: 'in-person' | 'virtual'
          location_or_link?: string | null
          status?: 'confirmed' | 'completed' | 'cancelled'
          rate?: number | null
          reminder_sent?: boolean
          review_prompted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          student_id?: string
          tutor_id?: string
          subject?: string
          scheduled_at?: string
          format?: 'in-person' | 'virtual'
          location_or_link?: string | null
          status?: 'confirmed' | 'completed' | 'cancelled'
          rate?: number | null
          reminder_sent?: boolean
          review_prompted?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sessions_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sessions_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sessions_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'session_requests'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          session_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          session_id: string
          reviewer_id: string
          tutor_id: string
          rating: number
          text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          reviewer_id: string
          tutor_id: string
          rating: number
          text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          reviewer_id?: string
          tutor_id?: string
          rating?: number
          text?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_session_id_fkey'
            columns: ['session_id']
            isOneToOne: true
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          status: 'open' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          status?: 'open' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          status?: 'open' | 'resolved'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reported_id_fkey'
            columns: ['reported_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      app_settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      expire_stale_requests: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
