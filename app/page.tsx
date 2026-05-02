import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <span className="text-lg font-bold text-indigo-600 tracking-tight">TutorMatch</span>
          <div className="flex items-center gap-3">
            <Link href="/apply" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Become a Tutor
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200">
            SAT &amp; ACT Prep
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Find your perfect{' '}
            <span className="text-indigo-600">peer tutor</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            TutorMatch connects students with high-scoring peers for one-on-one SAT and ACT prep.
            No agency fees. No strangers. Just people you trust, helping you reach your goal score.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Find a Tutor
            </Link>
            <Link
              href="/apply"
              className="rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50 px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How it works</h2>
          <div className="grid grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create your profile',
                body: "Tell us which test you're targeting, your weak subjects, and when you're free.",
              },
              {
                step: '02',
                title: 'Browse tutors',
                body: 'See real scores, teaching styles, and availability. Request a session in one click.',
              },
              {
                step: '03',
                title: 'Start improving',
                body: "Meet in person or virtually. Track your progress. Leave a review when you're done.",
              },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <div className="text-4xl font-black text-indigo-100 mb-4">{step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-sm text-gray-400">
          <span className="font-semibold text-indigo-600">TutorMatch</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </footer>

    </div>
  )
}
