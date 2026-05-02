import Link from 'next/link'
import type { UserRole } from '@/lib/types/app.types'

interface TopNavProps {
  role: UserRole
  userName: string
  avatarUrl?: string | null
}

const NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  student: [
    { href: '/discover',  label: 'Discover'  },
    { href: '/sessions',  label: 'Sessions'  },
    { href: '/messages',  label: 'Messages'  },
  ],
  tutor: [
    { href: '/requests',  label: 'Requests'  },
    { href: '/sessions',  label: 'Sessions'  },
    { href: '/messages',  label: 'Messages'  },
  ],
  admin: [
    { href: '/admin',                  label: 'Dashboard'    },
    { href: '/admin/applications',     label: 'Applications' },
    { href: '/admin/users',            label: 'Users'        },
    { href: '/admin/sessions',         label: 'Sessions'     },
    { href: '/admin/reports',          label: 'Reports'      },
  ],
}

export function TopNav({ role, userName, avatarUrl }: TopNavProps) {
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">

        {/* Left: logo + nav links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            TutorMatch
          </Link>
          <div className="flex items-center gap-0.5">
            {NAV_LINKS[role].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600
                  hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: avatar + profile link */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
            text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full
              bg-indigo-100 text-xs font-semibold text-indigo-700">
              {initials}
            </div>
          )}
          <span>{userName}</span>
        </Link>

      </div>
    </nav>
  )
}
