import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

/** Layout route that keeps every child route private. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // MSAL is still restoring the session: redirecting now would bounce the user
  // back to /login right after the redirect from the sign-in page.
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-sm text-slate-500">
        Restoring your session…
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where the user wanted to go so /login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
