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
      `Missing ${name}. Copy .env.example to .env.local and fill in the Microsoft Entra ID (B2C) values of your app registration.`,
    )
  }

  return value
}

/** Returns the host of an absolute URL, e.g. "your-tenant.b2clogin.com". */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    throw new Error(`"${url}" is not a valid absolute URL. Check your Vite environment variables.`)
  }
}

const clientId = requireEnv('VITE_AZURE_CLIENT_ID', import.meta.env.VITE_AZURE_CLIENT_ID)
const tenantName = requireEnv('VITE_AZURE_TENANT_NAME', import.meta.env.VITE_AZURE_TENANT_NAME)
const signUpSignInPolicy = requireEnv(
  'VITE_AZURE_SIGN_UP_SIGN_IN_POLICY',
  import.meta.env.VITE_AZURE_SIGN_UP_SIGN_IN_POLICY,
)

// Authority of the sign-up/sign-in policy, e.g.
// https://contoso.b2clogin.com/contoso.onmicrosoft.com/B2C_1_susi
const authority =
  readEnv(import.meta.env.VITE_AZURE_AUTHORITY) ??
  `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${signUpSignInPolicy}`

// B2C requires every authority host to be listed explicitly, otherwise MSAL refuses it.
const configuredAuthorities = readEnv(import.meta.env.VITE_AZURE_KNOWN_AUTHORITIES)
const knownAuthorities =
  configuredAuthorities === undefined
    ? [hostOf(authority)]
    : configuredAuthorities
        .split(',')
        .map((host) => host.trim())
        .filter((host) => host !== '')

// Absolute redirect URI of this SPA; it must be registered on the app registration.
const redirectUri = readEnv(import.meta.env.VITE_AZURE_REDIRECT_URI) ?? `${window.location.origin}/`
const postLogoutRedirectUri =
  readEnv(import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI) ?? redirectUri
const apiScope = readEnv(import.meta.env.VITE_AZURE_API_SCOPE)

// Azure AD B2C / Microsoft Entra ID configuration constants.
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

// Add scopes here for ID token to be used by MSAL Mobile/SPA applications.
export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email'],
}

// Scopes used when this app calls your own API with an access token.
// Set VITE_AZURE_API_SCOPE (e.g. https://your-tenant.onmicrosoft.com/api/access_as_user) to enable it.
export const apiRequest: SilentRequest = {
  scopes: apiScope === undefined ? [] : [apiScope],
}