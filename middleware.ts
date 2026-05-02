import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required by @supabase/ssr to keep cookies in sync
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── Pass-through: static assets and auth callback ─────────────────────
  if (pathname.startsWith('/api/auth')) return supabaseResponse

  // ── Public routes ──────────────────────────────────────────────────────
  const publicPaths = ['/', '/apply', '/reset-password']
  const isPublic = publicPaths.includes(pathname)

  // ── Auth pages: redirect logged-in users to their dashboard ───────────
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      return NextResponse.redirect(new URL(roleDashboard(profile?.role), request.url))
    }
    return supabaseResponse
  }

  if (isPublic) return supabaseResponse

  // ── All other routes require auth ─────────────────────────────────────
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role

  // ── Admin-only guard ───────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Student-only routes ────────────────────────────────────────────────
  const studentOnly = ['/discover', '/onboarding']
  if (studentOnly.some(p => pathname.startsWith(p)) && role !== 'student') {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url))
  }

  // ── Tutor-only routes ──────────────────────────────────────────────────
  if (pathname.startsWith('/requests') && role !== 'tutor') {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url))
  }

  // ── Student onboarding gate ────────────────────────────────────────────
  // Bounce students who haven't completed onboarding back to /onboarding.
  // Skip the check if they're already heading there to avoid a redirect loop.
  if (role === 'student' && !pathname.startsWith('/onboarding')) {
    const { data: sp } = await supabase
      .from('student_profiles').select('onboarding_done').eq('user_id', user.id).single()
    if (!sp?.onboarding_done) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

function roleDashboard(role?: string | null): string {
  if (role === 'admin') return '/admin'
  if (role === 'tutor') return '/requests'
  return '/discover'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
