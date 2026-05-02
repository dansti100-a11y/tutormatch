-- ============================================================
-- 003_triggers.sql
-- Database triggers for TutorMatch
-- ============================================================


-- ── 1. Auto-create profile row on signup ──────────────────────────────────
-- Fires after Supabase creates a row in auth.users.
-- Reads `name` and `role` from the signup metadata passed by the client.
-- New accounts default to 'student'; role is set to 'tutor' only by admin
-- when approving an application.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'student'   -- all sign-ups are students; tutor role is granted post-approval
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ── 2. Auto-create student_profile row after profile insert ───────────────
-- Creates a blank student_profiles row so onboarding checks never 404.

CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();


-- ── 3. Update tutor rating_avg + sessions_count after review ──────────────
-- Keeps tutor_profiles denormalized stats in sync without application-level
-- aggregation on every read.

CREATE OR REPLACE FUNCTION update_tutor_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE tutor_profiles
  SET
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE tutor_id = NEW.tutor_id
    ),
    sessions_count = (
      SELECT COUNT(*)
      FROM sessions
      WHERE tutor_id = NEW.tutor_id
        AND status = 'completed'
    )
  WHERE user_id = NEW.tutor_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_stats();


-- ── 4. Expire old pending session requests ────────────────────────────────
-- Called by the Vercel cron job (via /api/cron/expire-requests).
-- Marks requests as 'expired' if they're still pending after 48 hours.

CREATE OR REPLACE FUNCTION expire_stale_requests()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE session_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND created_at < now() - INTERVAL '48 hours';
END;
$$;
