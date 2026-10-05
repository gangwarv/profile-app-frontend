import { useCallback, useEffect, useState } from 'react'
import { fetchMyProfile, isApiConfigured, type BackendProfile } from '../api/profileApi.ts'
import { useAuth } from '../auth/useAuth.ts'

function initialsOf(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return initials === '' ? '?' : initials.slice(0, 2)
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? isoDate : date.toLocaleDateString()
}

export function Profile() {
  const { user, logout } = useAuth()
  const apiConfigured = isApiConfigured()
  const [profile, setProfile] = useState<BackendProfile | null>(null)
  // The first load starts with the page, so the loading flag comes from the config.
  const [isLoadingProfile, setIsLoadingProfile] = useState(apiConfigured)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Applies a profile request once it settles, so nothing sets state synchronously
  // when this is kicked off from the effect below.
  const handleProfileRequest = useCallback((request: Promise<BackendProfile>) => {
    request
      .then((data) => {
        setProfile(data)
        setProfileError(null)
      })
      .catch((cause) => {
        setProfile(null)
        setProfileError(
          cause instanceof Error ? cause.message : 'Unable to load your profile from the backend.',
        )
      })
      .finally(() => {
        setIsLoadingProfile(false)
      })
  }, [])

  // Ask the backend for the saved profile as soon as the signed-in page mounts.
  useEffect(() => {
    if (apiConfigured) {
      handleProfileRequest(fetchMyProfile(false))
    }
  }, [apiConfigured, handleProfileRequest])

  // ProtectedRoute already redirects, this keeps TypeScript happy.
  if (user === null) {
    return null
  }

  // MSAL clears the local cache and sends the browser back to `postLogoutRedirectUri`.
  const handleSignOut = async () => {
    await logout()
  }

  // Retry runs from a click, so it may flip the loading state synchronously.
  const handleRetry = () => {
    setIsLoadingProfile(true)
    setProfileError(null)
    handleProfileRequest(fetchMyProfile(true))
  }

  // Backend values win once GET /api/Profile answered; otherwise fall back to the MSAL account.
  const displayName = profile?.fullName || user.name
  const displayEmail = profile?.email || user.email

  const details = [
    { label: 'Name', value: displayName },
    { label: 'Email', value: displayEmail },
    ...(profile === null
      ? []
      : [
          { label: 'Role', value: profile.role },
          { label: 'Member since', value: formatDate(profile.createdAt) },
        ]),
    { label: 'Session', value: 'Active (Microsoft Entra ID / MSAL)' },
  ]

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white">
          {initialsOf(displayName)}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {displayName}
          </h1>
          <p className="text-sm text-slate-600">{displayEmail}</p>
        </div>
      </div>

      {!apiConfigured && (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          The backend profile is not connected yet — set{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
            VITE_AZURE_API_SCOPE
          </code>{' '}
          in{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
            .env
          </code>{' '}
          to load your saved profile from the API.
        </p>
      )}

      {apiConfigured && isLoadingProfile && (
        <p className="text-sm text-slate-500">Loading your profile from the backend…</p>
      )}

      {profileError !== null && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-red-700">
            {profileError}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="cursor-pointer rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            Grant access &amp; retry
          </button>
        </div>
      )}

      <dl className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm font-medium text-slate-500">
              {detail.label}
            </dt>
            <dd className="text-sm text-slate-900">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </section>
  )
}
