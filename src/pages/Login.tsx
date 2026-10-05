import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

type LoginLocationState = { from?: string }

export function Login() {
  const { login, isAuthenticated, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as LoginLocationState | null)?.from ?? '/profile'
  const isBusy = isLoading || isSubmitting

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      // Redirects to Microsoft Entra ID; failures come back through `error`.
      await login()
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
          Sign-in is handled by Microsoft Entra ID. You will be redirected to Microsoft&apos;s
          sign-in page and returned here afterwards.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
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
          disabled={isBusy}
          className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'Redirecting…' : 'Sign in with Microsoft'}
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
