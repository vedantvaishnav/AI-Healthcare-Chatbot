import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Chatbot', to: '/chatbot' },
  { name: 'Dashboard', to: '/dashboard' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const authenticatedLinks = user ? [
    ...navLinks,
    { name: 'Profile', to: '/profile' },
    { name: 'Saved Chats', to: '/saved-chats' },
  ] : [
    ...navLinks,
    { name: 'Login', to: '/login' },
    { name: 'Register', to: '/register' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-inner">
            H
          </span>
          HealthAI Assistant
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-8 lg:flex">
            {authenticatedLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `transition duration-200 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={logout}
                className="text-slate-600 hover:text-slate-900 transition duration-200"
              >
                Logout
              </button>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            {authenticatedLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm transition duration-200 ${
                    isActive ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="rounded-2xl px-4 py-3 text-sm text-left text-slate-700 hover:bg-slate-50 transition duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
