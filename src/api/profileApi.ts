import { apiRequest } from '../auth/authConfig.ts'
import { msalInstance } from '../auth/msalInstance.ts'

/** Profile row returned by the backend's GET /api/Profile (camelCase JSON). */
export type BackendProfile = {
  id: number
  azureOid: string
  email: string
  fullName: string
  role: string
  createdAt: string
}

type ProfileResponse = {
  message: string
  profile: BackendProfile
}

/** Base URL of the ASP.NET Core backend; matches its `http` launch profile. */
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
export const apiBaseUrl =
  configuredBaseUrl === undefined || configuredBaseUrl === ''
    ? 'https://localhost:7274'
    : configuredBaseUrl.replace(/\/+$/, '')

/** True once VITE_AZURE_API_SCOPE is set, i.e. the app can talk to the backend. */
export function isApiConfigured(): boolean {
  return apiRequest.scopes.length > 0
}

/**
 * Gets an access token for the backend API.
 *
 * Tries `acquireTokenSilent` first (works with the refresh token from sign-in).
 * When that fails — usually missing consent for the API scope — `interactive`
 * opens a popup so the user can grant it; without it the failure is surfaced.
 */
async function acquireAccessToken(interactive: boolean): Promise<string> {
  try {
    const result = await msalInstance.acquireTokenSilent(apiRequest)
    return result.accessToken
  } catch (cause) {
    if (!interactive) {
      throw cause
    }

    const result = await msalInstance.acquireTokenPopup(apiRequest)
    return result.accessToken
  }
}

/**
 * Loads the signed-in user's profile from the backend with a Bearer token.
 *
 * The backend validates the token against the same Microsoft Entra ID tenant and
 * provisions the profile on first call (see ProfileController in the backend).
 */
export async function fetchMyProfile(interactive = false): Promise<BackendProfile> {
  const accessToken = await acquireAccessToken(interactive)

  const response = await fetch(`${apiBaseUrl}/api/Profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`The profile API answered with HTTP ${response.status} (${response.statusText}).`)
  }

  const body = (await response.json()) as ProfileResponse
  return body.profile
}