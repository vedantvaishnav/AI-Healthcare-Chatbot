import { useState } from 'react'
import { FiSend } from 'react-icons/fi'

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <textarea
          rows="2"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your health question..."
          className="min-h-[84px] flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-cyan-600 px-6 text-sm font-semibold text-white transition duration-200 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <FiSend className="mr-2 h-5 w-5" />
          Send
        </button>
      </div>
    </form>
  )
}

export default ChatInput
