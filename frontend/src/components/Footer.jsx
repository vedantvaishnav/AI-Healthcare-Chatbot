import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-950/95 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-4">
          <h2 className="text-2xl font-semibold text-white">HealthAI Assistant</h2>
          <p className="text-sm leading-6 text-slate-400">
            AI Healthcare & Diet Assistant helps you track wellness, plan meals, and keep health data in one modern dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Quick links</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">About</h3>
            <p className="text-sm leading-6 text-slate-300">
              HealthAI Assistant is an AI-powered healthcare platform providing personalized diet suggestions, symptom analysis, and wellness tracking.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Contact</h3>
            <p className="text-sm leading-6 text-slate-300">For support and inquiries, please reach out through our platform.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800/70 bg-slate-950/95 text-center py-6 text-sm text-slate-500">
        © 2026 HealthAI Assistant. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
