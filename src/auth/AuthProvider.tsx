import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { EventType, InteractionType, InteractionStatus, type AccountInfo } from '@azure/msal-browser'
import { useMsal } from '@azure/msal-react'
import { AuthContext, type User } from './auth-context.ts'
import { loginRequest } from './authConfig.ts'

/** Turns "ada.lovelace@contoso.com" into "Ada Lovelace" when Entra ID returns no display name. */
function nameFromEmail(email: string): string {
  const [localPart = 'guest'] = email.split('@')
  const name = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return name === '' ? 'Guest' : name
}

/** Maps the MSAL account onto the user the app renders. */
function toUser(account: AccountInfo): User {
  const email = account.username

  return {
    name: account.name?.trim() || nameFromEmail(email),
    email,
  }
}

/** Turns MSAL errors into guidance the login screen can act on. */
function describeAuthError(cause: unknown): string {
  if (!(cause instanceof Error)) {
    return 'Unable to start the sign-in.'
  }

  const errorCode = (cause as Error & { errorCode?: string }).errorCode
  if (
    errorCode === 'endpoints_resolution_error' ||
    cause.message.includes('endpoints_resolution_error')
  ) {
    return (
      'MSAL could not resolve the Microsoft Entra ID sign-in endpoint. Check ' +
      'VITE_AZURE_AUTHORITY and VITE_AZURE_KNOWN_AUTHORITIES in .env — for Entra External ID (CIAM) ' +
      'the authority must include the tenant (https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com), ' +
      'and knownAuthorities must list both the name-based host and the tenant GUID host ' +
      '(<tenant-id>.ciamlogin.com), because the discovery issuer is GUID-based.'
    )
  }

  return cause.message
}

/**
 * Authentication backed by Microsoft Entra ID (Azure AD).
 *
 * `MsalProvider` (see App.tsx) initializes MSAL and completes the redirect that
 * the Entra ID sign-in page sends back, so this provider only has to expose
 * the MSAL account through the app's own `useAuth()` context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal()
  const [error, setError] = useState<string | null>(null)

  // `startup` / `handleRedirect` mean MSAL is restoring a session or finishing the redirect.
  const isLoading =
    inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect
  const [account = null] = accounts
  const user = useMemo(() => (account === null ? null : toUser(account)), [account])

  // MSAL only picks an active account once it finished initializing. Silent token
  // requests use that account when no account is passed explicitly.
  useEffect(() => {
    if (!isLoading && account !== null && instance.getActiveAccount() === null) {
      instance.setActiveAccount(account)
    }
  }, [account, instance, isLoading])

  // Failures of the redirect flow are reported as events, because msal-react
  // resolves `handleRedirectPromise()` internally. Only the redirect interaction
  // is surfaced: silent renewals fail with errors the user cannot act on.
  useEffect(() => {
    const callbackId = instance.addEventCallback(
      (message) => {
        if (message.error !== null && message.interactionType === InteractionType.Redirect) {
          setError(describeAuthError(message.error))
        }
      },
      [EventType.ACQUIRE_TOKEN_FAILURE],
    )

    return () => {
      if (callbackId !== null) {
        instance.removeEventCallback(callbackId)
      }
    }
  }, [instance])

  const login = useCallback(async () => {
    setError(null)

    try {
      // Leaves the SPA for the hosted Microsoft Entra ID sign-in page; MSAL picks
      // the flow up again from the redirect URI registered on the app registration.
      await instance.loginRedirect(loginRequest)
    } catch (cause) {
      setError(describeAuthError(cause))
    }
  }, [instance])

  const logout = useCallback(async () => {
    setError(null)

    try {
      // Clears the local MSAL cache, then redirects through the Microsoft sign-out page.
      await instance.logoutRedirect({ account: instance.getActiveAccount() })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign out.')
    }
  }, [instance])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isLoading, error, login, logout }),
    [user, isLoading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
