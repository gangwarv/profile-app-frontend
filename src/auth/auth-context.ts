import { createContext } from 'react'

/** The signed-in user as the app renders it. */
export type User = {
  name: string
  email: string
}

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  /** True while MSAL restores a session, e.g. while the redirect back from sign-in is handled. */
  isLoading: boolean
  /** Message of the last failed sign-in attempt, or null when there is nothing to report. */
  error: string | null
  /** Redirects the browser to the Microsoft Entra ID (B2C) sign-up/sign-in page. */
  login: () => Promise<void>
  /** Clears the MSAL cache and redirects through the B2C sign-out page. */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
