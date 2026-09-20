import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type User } from './auth-context.ts'

const STORAGE_KEY = 'profile-app:user'

function readStoredUser(): User | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? null : (JSON.parse(stored) as User)
  } catch {
    return null
  }
}

function nameFromEmail(email: string): string {
  const [localPart = 'guest'] = email.split('@')
  const name = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return name === '' ? 'Guest' : name
}

/**
 * Demo authentication.
 *
 * Replace the body of `login` with a real API call when the backend is ready.
 * The session is kept in localStorage so it survives page reloads.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  const login = useCallback(async (email: string, password: string) => {
    // Stand-in for the network round trip.
    await new Promise((resolve) => setTimeout(resolve, 400))

    const trimmedEmail = email.trim()

    if (trimmedEmail === '' || password === '') {
      throw new Error('Enter both an email and a password.')
    }

    const nextUser: User = { name: nameFromEmail(trimmedEmail), email: trimmedEmail }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)

    return nextUser
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
