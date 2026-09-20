import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { router } from './routes.tsx'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
