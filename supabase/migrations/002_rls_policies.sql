-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security for all TutorMatch tables
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_apps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings     ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the current user an admin? ──────────────────────────────────
-- Avoids repeating a subquery everywhere; defined as SECURITY DEFINER so it
-- can read profiles even from within a policy on profiles itself.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ── profiles ───────────────────────────────────────────────────────────────

-- Users read their own row; admin reads all
CREATE POLICY "profiles: own row" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- Tutor profiles are readable by any authenticated user (for discover feed)
CREATE POLICY "profiles: tutors public read" ON profiles
  FOR SELECT USING (role = 'tutor' AND auth.role() = 'authenticated');

-- Any authenticated user can read profiles of people they share a session with
CREATE POLICY "profiles: session participants" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM sessions
      WHERE (student_id = auth.uid() OR tutor_id = auth.uid())
        AND (student_id = profiles.id OR tutor_id = profiles.id)
    )
  );

-- Users update only their own row
CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin full access
CREATE POLICY "profiles: admin all" ON profiles
  FOR ALL USING (is_admin());


-- ── tutor_profiles ─────────────────────────────────────────────────────────

CREATE POLICY "tutor_profiles: authenticated read" ON tutor_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tutor_profiles: tutor update own" ON tutor_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "tutor_profiles: admin all" ON tutor_profiles
  FOR ALL USING (is_admin());


-- ── tutor_apps ─────────────────────────────────────────────────────────────

-- Public (unauthenticated) insert — the /apply page is accessible to anyone
CREATE POLICY "tutor_apps: public insert" ON tutor_apps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tutor_apps: admin all" ON tutor_apps
  FOR ALL USING (is_admin());


-- ── student_profiles ───────────────────────────────────────────────────────

CREATE POLICY "student_profiles: own row" ON student_profiles
  FOR ALL USING (user_id = auth.uid());

-- Tutors can view profiles of students who have booked them
CREATE POLICY "student_profiles: tutor session read" ON student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE tutor_id = auth.uid() AND student_id = student_profiles.user_id
    )
  );

CREATE POLICY "student_profiles: admin all" ON student_profiles
  FOR ALL USING (is_admin());


-- ── session_requests ───────────────────────────────────────────────────────

CREATE POLICY "session_requests: student own" ON session_requests
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "session_requests: tutor directed" ON session_requests
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "session_requests: admin read" ON session_requests
  FOR SELECT USING (is_admin());


-- ── sessions ───────────────────────────────────────────────────────────────

CREATE POLICY "sessions: participants read" ON sessions
  FOR SELECT USING (student_id = auth.uid() OR tutor_id = auth.uid());

-- Tutor inserts session row on acceptance
CREATE POLICY "sessions: tutor insert" ON sessions
  FOR INSERT WITH CHECK (tutor_id = auth.uid() OR is_admin());

-- Participants can update (e.g. mark completed, add location/link)
CREATE POLICY "sessions: participants update" ON sessions
  FOR UPDATE USING (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "sessions: admin all" ON sessions
  FOR ALL USING (is_admin());


-- ── messages ───────────────────────────────────────────────────────────────

CREATE POLICY "messages: session participants read" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id
        AND (student_id = auth.uid() OR tutor_id = auth.uid())
    )
  );

CREATE POLICY "messages: session participants insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id
        AND (student_id = auth.uid() OR tutor_id = auth.uid())
        AND status = 'confirmed'
    )
  );


-- ── reviews ────────────────────────────────────────────────────────────────

-- Any authenticated user can read reviews (shown on tutor profiles)
CREATE POLICY "reviews: authenticated read" ON reviews
  FOR SELECT USING (auth.role() = 'authenticated');

-- Student can insert a review for their own completed session
CREATE POLICY "reviews: student insert" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id
        AND student_id = auth.uid()
        AND status = 'completed'
    )
  );

CREATE POLICY "reviews: admin all" ON reviews
  FOR ALL USING (is_admin());


-- ── reports ────────────────────────────────────────────────────────────────

CREATE POLICY "reports: authenticated insert" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid() AND auth.role() = 'authenticated');

CREATE POLICY "reports: admin all" ON reports
  FOR ALL USING (is_admin());


-- ── app_settings ───────────────────────────────────────────────────────────

-- All authenticated users can read settings (e.g. discover feed checks threshold)
CREATE POLICY "app_settings: authenticated read" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "app_settings: admin write" ON app_settings
  FOR ALL USING (is_admin());
