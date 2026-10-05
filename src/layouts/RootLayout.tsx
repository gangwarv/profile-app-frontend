import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

/** Shared shell: header navigation, routed content and footer. */
export function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth()

  // MSAL clears the local cache and sends the browser back to `postLogoutRedirectUri`.
  const handleSignOut = async () => {
    await logout()
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link to="/" className="text-base font-semibold tracking-tight">
            Profile<span className="text-indigo-600">App</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2">
                <span className="hidden text-sm text-slate-500 sm:inline">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="cursor-pointer rounded-full border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-slate-500">
          Built with React, Vite, Tailwind CSS v4 and React Router.
        </div>
      </footer>
    </div>
  )
}
