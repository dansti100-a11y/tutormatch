-- ============================================================
-- seed.sql
-- Default data for TutorMatch
-- Run after all migrations.
-- ============================================================

-- Default configurable constants
INSERT INTO app_settings (key, value) VALUES
  ('tutor_pool_threshold', '8'),      -- discover feed switches to Mode B above this count
  ('app_name',             '"TutorMatch"'),
  ('contact_email',        '"hello@tutormatch.app"')
ON CONFLICT (key) DO NOTHING;
