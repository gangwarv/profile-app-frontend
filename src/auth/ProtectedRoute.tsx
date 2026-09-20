import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

/** Layout route that keeps every child route private. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where the user wanted to go so /login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
