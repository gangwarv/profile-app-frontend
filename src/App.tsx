import { MsalProvider } from '@azure/msal-react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { msalInstance } from './auth/msalInstance.ts'
import { router } from './routes.tsx'

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MsalProvider>
  )
}

export default App
