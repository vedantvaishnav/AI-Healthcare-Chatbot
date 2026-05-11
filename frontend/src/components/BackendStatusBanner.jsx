import { useEffect, useState } from 'react'
import api from '../services/api'

function BackendStatusBanner() {
  const [status, setStatus] = useState('checking')
  const [message, setMessage] = useState('Checking backend availability...')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.get('/api/healthtips')
        setStatus('ok')
      } catch (error) {
        setStatus('error')
        setMessage(
          error?.response?.data?.error ||
            error?.message ||
            'Unable to reach backend. Some features may not work.'
        )
      }
    }

    checkBackend()
  }, [])

  if (status !== 'error') {
    return null
  }

  return (
    <div className="sticky top-16 z-40 border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p>{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-3xl bg-rose-100 px-3 py-2 text-rose-700 transition hover:bg-rose-200"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default BackendStatusBanner
