import type { Database } from './database.types'

// ── Row type aliases ───────────────────────────────────────────────────────
export type Profile        = Database['public']['Tables']['profiles']['Row']
export type TutorProfile   = Database['public']['Tables']['tutor_profiles']['Row']
export type TutorApp       = Database['public']['Tables']['tutor_apps']['Row']
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row']
export type SessionRequest = Database['public']['Tables']['session_requests']['Row']
export type Session        = Database['public']['Tables']['sessions']['Row']
export type Message        = Database['public']['Tables']['messages']['Row']
export type Review         = Database['public']['Tables']['reviews']['Row']
export type Report         = Database['public']['Tables']['reports']['Row']
export type AppSetting     = Database['public']['Tables']['app_settings']['Row']

// ── Domain types ───────────────────────────────────────────────────────────
export type UserRole = 'student' | 'tutor' | 'admin'

export type DiscoverMode = 'A' | 'B'

export type TutorScores = {
  sat?: { math?: number; reading?: number }
  act?: { composite?: number; math?: number; english?: number; reading?: number; science?: number }
}

export type AvailabilitySlots = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string[]>
>

export type SubjectName =
  | 'SAT Math'
  | 'SAT Reading'
  | 'ACT Math'
  | 'ACT English'
  | 'ACT Reading'
  | 'ACT Science'

export type StyleTag = 'visual' | 'drill-heavy' | 'conceptual' | 'strategy-focused'

// ── Joined / enriched types ────────────────────────────────────────────────
export type TutorWithProfile = Profile & {
  tutor_profiles: TutorProfile
}

export type SessionWithParticipants = Session & {
  student: Profile
  tutor: TutorWithProfile
}

export type SessionRequestWithParticipants = SessionRequest & {
  student: Profile
  tutor: TutorWithProfile
}

export type TutorAppWithSignedUrl = TutorApp & {
  screenshot_signed_url?: string
}
