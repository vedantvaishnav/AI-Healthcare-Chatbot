import { createContext, useContext, useEffect, useState } from 'react'
import api, { setAuthToken } from '../services/api'
import { storage } from '../services/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('healthai_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      localStorage.setItem('healthai_token', token)
      api
        .get('/api/auth/me')
        .then((response) => setUser(response.data.user))
        .catch(() => {
          setUser(null)
          setToken(null)
          setAuthToken(null)
          localStorage.removeItem('healthai_token')
        })
        .finally(() => setLoading(false))
    } else {
      setAuthToken(null)
      setLoading(false)
    }
  }, [token])

  const login = async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    const accessToken = response.data.token
    setToken(accessToken)
    setUser(response.data.user)
    setAuthToken(accessToken)
    localStorage.setItem('healthai_token', accessToken)
    return response.data
  }

  const register = async (payload) => {
    const response = await api.post('/api/auth/register', payload)
    const accessToken = response.data.token
    setToken(accessToken)
    setUser(response.data.user)
    setAuthToken(accessToken)
    localStorage.setItem('healthai_token', accessToken)
    return response.data
  }

  const logout = () => {
    const currentUser = user
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem('healthai_token')
    // clear user-scoped local storage to avoid leaking data to next user
    try {
      // remove current user's keys
      storage.removeItem('healthProfile', currentUser)
      storage.removeItem('chatMessages', currentUser)
      storage.removeItem('chatSessionId', currentUser)
    } catch (e) {
      // fallback: attempt to remove generic keys
      try { storage.removeItem('healthProfile', 'guest') } catch (e) {}
      try { storage.removeItem('chatMessages', 'guest') } catch (e) {}
      try { storage.removeItem('chatSessionId', 'guest') } catch (e) {}
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
