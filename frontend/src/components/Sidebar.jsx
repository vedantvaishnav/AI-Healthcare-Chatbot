import { useEffect, useState } from 'react'
import api from '../services/api'

function Sidebar({ sessions, onSessionSelect, onQuickPrompt }) {
  const [tips, setTips] = useState([])

  useEffect(() => {
    api
      .get('/api/healthtips')
      .then((response) => setTips(response.data.tips || []))
      .catch(() => setTips([]))
  }, [])

  return (
    <aside className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-glass">
      <div className="rounded-[2rem] bg-cyan-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Healthcare Workspace</p>
        <p className="mt-4 text-sm text-slate-700">Use the sidebar for quick symptom prompts, saved sessions, and wellness tips.</p>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Quick actions</p>
        <div className="mt-4 space-y-3">
          {['Check symptoms', 'Suggest disease', 'First aid', 'Emergency warning'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onQuickPrompt(label)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Saved sessions</p>
        <div className="mt-4 space-y-3">
          {sessions.length ? (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSessionSelect(session)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <p className="font-semibold text-slate-900">{session.name}</p>
                <p className="mt-1 text-xs text-slate-500">{session.last_message?.slice(0, 50) || 'No messages yet'}</p>
              </button>
            ))
          ) : (
            <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">No saved sessions yet. Start a chat to see them here.</div>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Wellness tips</p>
        <div className="mt-4 space-y-4">
          {tips.slice(0, 3).map((tip) => (
            <div key={tip.title} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{tip.title}</p>
              <p className="mt-2 text-slate-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
