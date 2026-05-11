import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-lg">
        <h1 className="text-4xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-4 text-sm text-slate-600">The page you are looking for does not exist or could not be loaded.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Go back home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
