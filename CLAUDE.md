# TutorMatch

A desktop web app that matches students with tutors for SAT/ACT prep, hyperlocal to a single school.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Backend / Auth / DB**: Supabase (`@supabase/ssr`)
- **Email**: Resend
- **Validation**: Zod (server-side only)
- **Language**: TypeScript — always, no exceptions

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Founder; full access to all data, approvals, and settings |
| `tutor` | Approved tutor; manages availability and sessions |
| `student` | Any student; browses tutors and books sessions |

Role is stored on `profiles.role` and enforced via RLS policies (see `supabase/migrations/002_rls_policies.sql`).

## Hard Rules

- **Desktop only.** Never add `sm:`, `md:`, or `lg:` Tailwind breakpoints. All UI targets a 1280px+ viewport.
- **TypeScript only.** No `.js` or `.jsx` files.
- **Supabase for everything.** No other auth libraries, no other databases.
- **RLS enforced.** Every table has RLS enabled. Never disable RLS or use the service-role key in client components.
- **Server Components by default.** Add `"use client"` only when a component needs browser APIs or interactivity.
- **Mutations via Server Actions**, not API routes (except cron and auth callback).

## Project Structure

```
/app
  page.tsx                          # Landing page (public)
  layout.tsx                        # Root layout
  /login  /signup  /apply           # Public auth pages
  /(auth)/                          # Authenticated layout (TopNav, role-based)
    /discover                       # Student: browse tutors
    /discover/[tutorId]             # Student: tutor profile + request session
    /onboarding                     # Student: first-time setup
    /requests                       # Tutor: incoming session requests
    /sessions                       # Both: upcoming/past sessions
    /messages  /messages/[threadId] # Both: message threads (Realtime)
    /profile                        # Both: edit profile
  /admin/                           # Admin-only layout (real folder, not route group)
    /page                           # /admin — Dashboard
    /applications  /applications/[id]
    /users  /sessions  /reports  /settings
  /api/auth/callback                # Supabase OAuth/magic-link callback
  /api/cron                         # Hourly: reminders + expire requests

/components
  /ui        Button, Input, Textarea, Badge, Modal
  /nav       TopNav
  /tutor     TutorCard, TutorProfile, ScoreBadge  (Step 6)
  /discover  DiscoverModeA, DiscoverModeB          (Step 6 / v2)
  /session   SessionRequestForm, SessionCard       (Step 7)
  /messages  MessageThread, MessageBubble          (Step 9)
  /admin     ApplicationRow, StatsCard             (Step 11)

/lib
  /supabase  server.ts (createClient, createAdminClient), browser.ts
  /types     database.types.ts (regenerate from Supabase), app.types.ts
  /utils     scoring.ts, availability.ts, format.ts
  /email     templates.ts, send.ts  (Step 12)

/supabase
  /migrations
    001_initial_schema.sql
    002_rls_policies.sql
    003_triggers.sql
  seed.sql

middleware.ts   # Route protection + onboarding gate
vercel.json     # Cron schedule (hourly /api/cron)
```

## Supabase Conventions

- **Server**: `import { createClient } from '@/lib/supabase/server'` — call `await createClient()`.
- **Admin (server-only)**: `import { createAdminClient } from '@/lib/supabase/server'` — never in client components.
- **Browser**: `import { createClient } from '@/lib/supabase/browser'` — only in `"use client"` components.
- **Types**: regenerate after schema changes: `npx supabase gen types typescript --local > lib/types/database.types.ts`
- **Realtime**: subscribe to `messages` table filtered by `session_id` in message thread pages.

## Discover Feed — Dual Mode

The feed mode is determined at runtime in `app/(auth)/discover/page.tsx`:

```ts
const threshold = await getThreshold()   // reads app_settings
const count     = await getTutorCount()
const mode: DiscoverMode = count >= threshold ? 'B' : 'A'
```

- **Mode A** (default, current): scrollable grid of tutor cards, no matching logic.
- **Mode B** (future): Hinge-style match stack with `computeCompatibilityScore()` from `lib/utils/scoring.ts`.
- `DiscoverModeB` component is built in v1 but only renders above the threshold.
- Changing the threshold in `/admin/settings` switches the mode with no deploy.

## Build Order (Reference)

| Step | Scope |
|------|-------|
| 1 | Supabase schema + RLS + triggers ✅ |
| 2 | Next.js scaffold + lib/ + middleware + UI primitives ✅ |
| 3 | Auth flows: /login, /signup, /apply, onboarding |
| 4 | Student onboarding form ✅ |
| 5 | Tutor application → admin approval → email |
| 6 | Discover feed Mode A + tutor profile page ✅ |
| 7 | Session request flow (request, accept, counter) ✅ |
| 8 | Sessions pages (upcoming/past for both roles) ✅ |
| 9 | Messaging (thread list, thread view, Realtime) ✅ |
| 10 | Reviews (post-session form, display on profile) ✅ |
| 11 | Admin dashboard (users, sessions, reports, settings) |
| 12 | Email notifications (Resend) + Vercel cron |
| 13 | Discover feed Mode B scaffold |

## Session Progress (May 3, 2026)

✅ **Completed in this session:**
- **GitHub Setup**: Configured remote repository and pushed initial codebase
- **Environment Configuration**: Fixed Supabase environment variables (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Development Server**: Successfully running on http://localhost:3000
- **Student Onboarding Feature**: Complete 4-step wizard implementation
  - `actions.ts`: Server Action with Zod validation, FormData processing, and database updates
  - `OnboardingForm.tsx`: Multi-step wizard with progress bar (Grade/Test → Subjects/Scores → Availability → Preferences)
  - `page.tsx`: Server component with user prefetching and redirect logic for completed onboarding
- **Code Quality**: All changes committed and pushed to GitHub with detailed commit messages
- **Major Feature Implementation (Steps 6-10)**: Complete discover feed, session requests, sessions management, messaging, and reviews system
  - **Step 6 - Discover Feed**: Tutor cards, profiles, and Mode A grid implementation
  - **Step 7 - Session Requests**: Full request flow with modals, acceptance, counter-offers, and status management
  - **Step 8 - Sessions Pages**: Comprehensive session management with upcoming/past views and completion tracking
  - **Step 9 - Messaging**: Real-time messaging with Supabase subscriptions, optimistic updates, and thread management
  - **Step 10 - Reviews**: Interactive star ratings and review system integrated into session completion flow
- **21 new files created** with 1793 lines of code added

**Ready for next session:** Core student-tutor matching functionality is complete. Next steps could include tutor application forms, admin dashboard, or email notifications.

## Coding Conventions

- No `any` — use proper types or `unknown`.
- No inline styles — Tailwind utility classes only.
- Validate all user input with Zod inside Server Actions.
- `createAdminClient()` only in Server Components / Route Handlers — never imported from a `"use client"` file.
- `rate` column exists on `sessions` but is hidden from all UI in v1.
