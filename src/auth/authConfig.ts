import {
  LogLevel,
  type Configuration,
  type RedirectRequest,
  type SilentRequest,
} from '@azure/msal-browser'

/** Reads a Vite environment variable, treating blank values as "not configured". */
function readEnv(raw: string | undefined): string | undefined {
  const value = raw?.trim()
  return value === undefined || value === '' ? undefined : value
}

/** Reads a required Vite environment variable, or explains how to configure it. */
function requireEnv(name: string, raw: string | undefined): string {
  const value = readEnv(raw)

  if (value === undefined) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in the values of your Microsoft Entra ID app registration.`,
    )
  }

  return value
}

/** Returns the host of an absolute URL, e.g. "gangwarvs.ciamlogin.com". */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    throw new Error(`"${url}" is not a valid absolute URL. Check your Vite environment variables.`)
  }
}

const clientId = requireEnv('VITE_AZURE_CLIENT_ID', import.meta.env.VITE_AZURE_CLIENT_ID)
const tenant = readEnv(import.meta.env.VITE_AZURE_TENANT_SUBDOMAIN)
const configuredAuthority = readEnv(import.meta.env.VITE_AZURE_AUTHORITY)

// Either the CIAM tenant subdomain or a full authority URL must be given — the
// authority cannot be built without knowing the tenant.
if (tenant === undefined && configuredAuthority === undefined) {
  throw new Error(
    'Missing VITE_AZURE_TENANT_SUBDOMAIN (or VITE_AZURE_AUTHORITY). Copy .env.example to .env.local and fill in your Microsoft Entra ID tenant.',
  )
}

// Authority of the Entra External ID (CIAM) tenant. The tenant path segment is
// required: https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com — a bare host
// cannot serve the OIDC discovery document.
const authority =
  configuredAuthority ?? `https://${tenant}.ciamlogin.com/${tenant}.onmicrosoft.com`

// hostOf() also validates that the authority is a well-formed absolute URL.
const authorityHost = hostOf(authority)

// Fail fast with actionable guidance instead of letting MSAL surface a cryptic
// endpoints_resolution_error at sign-in time.
if (new URL(authority).pathname.replace(/\/+$/, '') === '') {
  const example = authorityHost.endsWith('.ciamlogin.com')
    ? `https://${authorityHost}/<tenant>.onmicrosoft.com`
    : `https://${authorityHost}/<tenant-id-or-domain>`
  throw new Error(
    `VITE_AZURE_AUTHORITY ("${authority}") is missing the tenant path segment, so MSAL cannot resolve the sign-in endpoints (endpoints_resolution_error). Expected e.g. ${example}.`,
  )
}

// MSAL only talks to hosts it knows: custom authority hosts (e.g. <tenant>.ciamlogin.com)
// must be listed explicitly, otherwise it refuses the authority.
const configuredAuthorities = readEnv(import.meta.env.VITE_AZURE_KNOWN_AUTHORITIES)
const knownAuthorities =
  configuredAuthorities === undefined
    ? [authorityHost]
    : configuredAuthorities
        .split(',')
        .map((host) => host.trim())
        .filter((host) => host !== '')

// Absolute redirect URI of this SPA; it must be registered on the app registration.
const redirectUri = readEnv(import.meta.env.VITE_AZURE_REDIRECT_URI) ?? `${window.location.origin}/`
const postLogoutRedirectUri =
  readEnv(import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI) ?? redirectUri
const apiProfileScope = readEnv(import.meta.env.VITE_AZURE_PROFILE_SCOPE)
const apiUsersScope = readEnv(import.meta.env.VITE_AZURE_USERS_SCOPE)

// Microsoft Entra ID (Azure AD) configuration constants.
export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    knownAuthorities,
    redirectUri,
    postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use 'localStorage' to keep the session across browser restarts.
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      },
    },
  },
}

// ID token scopes for the sign-in request. `offline_access` asks Entra ID for a
// refresh token so MSAL can renew tokens silently after the redirect completes.
export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', 'offline_access'],
}

// Scopes used when this app calls your own API with an access token.
// Set VITE_AZURE_API_SCOPE (e.g. api://<backend-client-id>/.default) to enable it.
export const apiRequest: SilentRequest = {
  scopes: apiProfileScope === undefined ? [] : [apiProfileScope, apiUsersScope!],
}