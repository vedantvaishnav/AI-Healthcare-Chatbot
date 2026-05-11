import { createContext, useContext, useEffect, useState } from 'react'
import api, { setAuthToken } from '../services/api'

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
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem('healthai_token')
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
