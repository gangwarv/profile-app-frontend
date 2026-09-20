import { createContext } from 'react'

export type User = {
  name: string
  email: string
}

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  /** Resolves with the signed-in user, or rejects with an Error. */
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
