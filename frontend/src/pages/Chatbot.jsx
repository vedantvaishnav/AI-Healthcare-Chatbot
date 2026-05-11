import { useState } from 'react'
import api from '../services/api'
import ChatInput from '../components/chatbot/ChatInput'
import ChatWindow from '../components/chatbot/ChatWindow'

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello! I am your AI Healthcare Assistant. Ask me about diet, symptoms, or wellness support. This is AI-generated advice. Please consult a medical professional.',
  timestamp: new Date().toISOString(),
}

const QUICK_QUESTIONS = [
  'Suggest healthy diet',
  'How to reduce weight?',
  'BMI information',
  'Symptoms of dehydration',
  'Best foods for immunity',
]

function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendError, setBackendError] = useState(false)

  const handleSend = async (message) => {
    if (!message.trim() || loading) {
      return
    }

    setError(null)
    const timestamp = new Date().toISOString()
    const userMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      text: message.trim(),
      timestamp,
    }

    setMessages((current) => [...current, userMessage])
    setLoading(true)

    try {
      console.log('Chat request:', userMessage.text)
      const response = await api.post('/api/chat', { message: userMessage.text })
      console.log('Chat response data:', response?.data)

      const replyText =
        response?.data?.reply ||
        response?.data?.message ||
        'I could not generate a response. Please try again.'

      const assistantTimestamp = new Date().toISOString()
      const assistantMessage = {
        id: `assistant-${assistantTimestamp}`,
        role: 'assistant',
        text: replyText,
        timestamp: assistantTimestamp,
      }

      setMessages((current) => [...current, assistantMessage])
      setBackendError(false)
      setError(null)
    } catch (err) {
      console.error('Chat error:', err)
      setBackendError(true)
      const fallback =
        err?.response?.data?.reply ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to reach the AI assistant. Please check your backend and try again.'

      setError(fallback)
      const fallbackTimestamp = new Date().toISOString()
      const assistantMessage = {
        id: `assistant-${fallbackTimestamp}`,
        role: 'assistant',
        text: fallback,
        timestamp: fallbackTimestamp,
      }
      setMessages((current) => [...current, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (text) => {
    if (!loading) {
      handleSend(text)
    }
  }

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    setError(null)
    setBackendError(false)
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">AI Healthcare Assistant</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Smart clinical guidance for your diet and wellness journey.
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600">
                Chat with the AI assistant, ask guided health questions, and receive thoughtful responses in a calm, modern dashboard layout.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-slate-900 px-4 py-3 text-sm text-white shadow-sm">
              <span className={`flex h-3 w-3 rounded-full ${backendError ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              {backendError ? 'Offline' : 'Online'}
            </div>
          </div>

          {backendError && (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <p className="font-semibold">Backend connection lost</p>
              <p className="mt-2 text-xs">Please check your backend server and refresh the page.</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Quick questions</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestion(question)}
                  disabled={loading}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition duration-200 hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-glass backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Chat</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Talk to HealthAI</h2>
              </div>
              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:border-cyan-300 hover:bg-cyan-100"
              >
                Clear chat
              </button>
            </div>

            <ChatWindow messages={messages} loading={loading} error={error} />
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>

          <aside className="space-y-6 rounded-[2rem] border border-white/80 bg-slate-950/95 p-6 text-slate-100 shadow-glass backdrop-blur-xl">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Health tips</p>
              <h3 className="text-xl font-semibold text-white">A modern assistant with medical-aware guidance</h3>
              <p className="text-sm leading-7 text-slate-300">
                This chatbot helps you explore healthy eating, hydration, BMI awareness, and symptom prevention while keeping safety and medical disclaimer language in every answer.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Reminder</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                HealthAI is an assistant, not a substitute for licensed medical advice. Always consult your doctor for diagnosis and treatment.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Chatbot
