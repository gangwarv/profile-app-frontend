import { useAuth } from '../auth/useAuth.ts'

function initialsOf(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return initials === '' ? '?' : initials.slice(0, 2)
}

export function Profile() {
  const { user, logout } = useAuth()

  // ProtectedRoute already redirects, this keeps TypeScript happy.
  if (user === null) {
    return null
  }

  // MSAL clears the local cache and sends the browser back to `postLogoutRedirectUri`.
  const handleSignOut = async () => {
    await logout()
  }

  const details = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Session', value: 'Active (Microsoft Entra ID / MSAL)' },
  ]

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white">
          {initialsOf(user.name)}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {user.name}
          </h1>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
      </div>

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
