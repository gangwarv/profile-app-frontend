import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig.ts'

/**
 * Single MSAL instance for the whole page load.
 *
 * It lives in its own module so Vite's hot module replacement does not create a
 * second instance, which would corrupt the MSAL cache. `MsalProvider` is
 * responsible for calling `initialize()` and `handleRedirectPromise()`.
 */
export const msalInstance = new PublicClientApplication(msalConfig)
