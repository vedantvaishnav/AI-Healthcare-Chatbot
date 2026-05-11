import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Profile() {
  const { user, logout } = useAuth()

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-glass">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Your profile</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Account overview</h1>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Sign out
            </button>
          </div>

          {user ? (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Name</p>
                <p className="mt-3 text-xl font-semibold text-slate-950">{user.name}</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Email</p>
                <p className="mt-3 text-xl font-semibold text-slate-950">{user.email}</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Joined</p>
                <p className="mt-3 text-xl font-semibold text-slate-950">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-700">
              You are not signed in. <Link to="/login" className="text-cyan-600">Sign in to your account.</Link>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-glass">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Health record</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Personalized history</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">All of your chat sessions and healthcare insights are stored securely. Use the dashboard to continue conversations and review wellness decisions.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-glass">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Secure access</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">JWT authentication</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Your account uses token-based authentication for secure access to saved chats and health tools.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
