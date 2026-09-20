import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

type LoginLocationState = { from?: string }

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as LoginLocationState | null)?.from ?? '/profile'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Log in
        </h1>
        <p className="text-sm text-slate-600">
          Demo sign-in — any email and any non-empty password is accepted.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        {error !== null && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Changed your mind?{' '}
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          Back to home
        </Link>
      </p>
    </section>
  )
}
