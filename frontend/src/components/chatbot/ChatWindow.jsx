import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

function ChatWindow({ messages, loading, error }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  return (
    <div className="flex h-[560px] flex-col rounded-[2rem] border border-slate-200/80 bg-slate-50/95 p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between rounded-3xl bg-white/90 px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">AI Healthcare Chat</p>
          <p className="text-sm text-slate-500">Ask a question and receive a safe, health-focused response.</p>
        </div>
        <div className="flex items-center gap-2 rounded-3xl bg-cyan-100 px-4 py-2 text-sm text-cyan-800">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Online
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}

export default ChatWindow
