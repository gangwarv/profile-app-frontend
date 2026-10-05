import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

const routeCards = [
  {
    to: '/',
    path: '/',
    title: 'Home',
    description: 'Public landing route. Greets you once a session exists.',
  },
  {
    to: '/profile',
    path: '/profile',
    title: 'Profile',
    description: 'Private route. Redirects to /login when there is no session.',
  },
  {
    to: '/login',
    path: '/login',
    title: 'Log in',
    description: 'Redirects to the Microsoft Entra ID (B2C) sign-up/sign-in page.',
  },
]

export function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-col items-start gap-5">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
          Home
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {isAuthenticated && user !== null
            ? `Welcome back, ${user.name}`
            : 'Profile App'}
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          A React + Vite + Tailwind starter with three routes and Microsoft Entra ID
          (B2C) sign-in.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/profile"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            View profile
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routeCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {card.title}
            </h2>
            <p className="text-sm text-slate-600">{card.description}</p>
            <code className="mt-auto w-fit rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
              {card.path}
            </code>
          </Link>
        ))}
      </div>
    </section>
  )
}
