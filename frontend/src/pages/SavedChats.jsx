import { useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function SavedChats() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get('/api/chats')
      .then((response) => {
        setSessions(response.data.sessions || [])
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'Unable to load saved chats.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-glass">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Saved Conversations</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your latest health sessions</h1>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">No sessions saved yet. Start a chat to build your personal health history.</div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{session.name}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{session.message_count} messages</p>
                  <p className="mt-2 text-sm text-slate-600">Last message: {session.last_message || 'No messages yet'}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Created {new Date(session.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SavedChats
