import { AiOutlineRobot } from 'react-icons/ai'
import { FiUser } from 'react-icons/fi'

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const Icon = isUser ? FiUser : AiOutlineRobot

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      )}

      <div className={`max-w-[82%] rounded-[2rem] border px-5 py-4 text-sm leading-6 shadow-sm ${
        isUser
          ? 'rounded-br-[0.8rem] bg-cyan-600 text-white border-cyan-600'
          : 'rounded-bl-[0.8rem] bg-white text-slate-900 border-slate-200'
      }`}>
        <p>{message.text}</p>
        <p className="mt-3 text-right text-[11px] uppercase tracking-[0.25em] text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {isUser && (
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-800 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}

export default ChatMessage
