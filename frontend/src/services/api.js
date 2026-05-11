import axios from 'axios'

// Get backend URL from environment variable or use localhost as fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(new Error('Failed to send request to backend'))
  }
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = `Backend unavailable at ${BACKEND_URL}. Make sure your backend is running and the URL is correct.`
    }
    return Promise.reject(error)
  }
)

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export default api
