import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
        404
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="text-sm text-slate-600">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
      >
        Back to home
      </Link>
    </section>
  )
}
