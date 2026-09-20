import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { RootLayout } from './layouts/RootLayout.tsx'
import { Home } from './pages/Home.tsx'
import { Login } from './pages/Login.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { Profile } from './pages/Profile.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      {
        // /profile and any future private route live under this guard.
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <Profile /> }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
