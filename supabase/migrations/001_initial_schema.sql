-- ============================================================
-- 001_initial_schema.sql
-- Core tables for TutorMatch
-- Run in order: schema → RLS (002) → triggers (003) → seed (seed.sql)
-- ============================================================

-- profiles (mirrors auth.users — created automatically via trigger in 003)
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '',
  email       text NOT NULL DEFAULT '',
  role        text NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- tutor_profiles (created by admin after approving a tutor_app)
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores_json     jsonb NOT NULL DEFAULT '{}',
  subjects        text[] NOT NULL DEFAULT '{}',
  bio_prompt      text NOT NULL DEFAULT '',
  availability    jsonb NOT NULL DEFAULT '{}',
  verified        boolean NOT NULL DEFAULT false,
  screenshot_path text,                        -- Storage path; admin-only access
  rating_avg      numeric(3,2) NOT NULL DEFAULT 0,
  sessions_count  integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- tutor_apps (submitted by anyone; no auth required to apply)
CREATE TABLE IF NOT EXISTS tutor_apps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name  text NOT NULL,
  applicant_email text NOT NULL,
  scores_json     jsonb NOT NULL DEFAULT '{}',
  subjects        text[] NOT NULL DEFAULT '{}',
  bio             text NOT NULL DEFAULT '',
  availability    jsonb NOT NULL DEFAULT '{}',
  screenshot_path text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- student_profiles (created during student onboarding flow)
CREATE TABLE IF NOT EXISTS student_profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grade            smallint,
  target_test      text CHECK (target_test IN ('SAT', 'ACT', 'both')),
  weak_subjects    text[] NOT NULL DEFAULT '{}',
  current_score    integer,
  goal_score       integer,
  availability     jsonb NOT NULL DEFAULT '{}',
  preferred_format text CHECK (preferred_format IN ('in-person', 'virtual', 'either')),
  style_tags       text[] NOT NULL DEFAULT '{}',
  onboarding_done  boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- session_requests (student → tutor; precedes a confirmed session)
CREATE TABLE IF NOT EXISTS session_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES profiles(id),
  tutor_id      uuid NOT NULL REFERENCES profiles(id),
  subject       text NOT NULL,
  time_options  jsonb NOT NULL DEFAULT '[]',   -- array of ISO datetime strings (up to 3)
  format        text NOT NULL CHECK (format IN ('in-person', 'virtual')),
  note          text,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'declined', 'countered', 'expired')),
  counter_times jsonb,                          -- tutor's proposed alternative slots
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- sessions (confirmed bookings)
CREATE TABLE IF NOT EXISTS sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id        uuid REFERENCES session_requests(id),
  student_id        uuid NOT NULL REFERENCES profiles(id),
  tutor_id          uuid NOT NULL REFERENCES profiles(id),
  subject           text NOT NULL,
  scheduled_at      timestamptz NOT NULL,
  format            text NOT NULL CHECK (format IN ('in-person', 'virtual')),
  location_or_link  text,
  status            text NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  rate              numeric,             -- reserved for v3; hidden in all v1 UI
  reminder_sent     boolean NOT NULL DEFAULT false,
  review_prompted   boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- messages (one thread per confirmed session)
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES profiles(id),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- reviews (student → tutor; one review per session)
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid UNIQUE NOT NULL REFERENCES sessions(id),
  reviewer_id  uuid NOT NULL REFERENCES profiles(id),
  tutor_id     uuid NOT NULL REFERENCES profiles(id),
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- reports (any user can file; only admin can read)
CREATE TABLE IF NOT EXISTS reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid NOT NULL REFERENCES profiles(id),
  reported_id  uuid NOT NULL REFERENCES profiles(id),
  reason       text NOT NULL,
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- app_settings (key/value config; admin-editable at /admin/settings)
CREATE TABLE IF NOT EXISTS app_settings (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL
);
