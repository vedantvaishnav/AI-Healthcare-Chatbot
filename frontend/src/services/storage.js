// Simple namespaced localStorage helper to isolate data per user

const getUserId = (user) => {
  if (!user) return 'guest'
  if (typeof user === 'object') {
    if (user.id) return String(user.id)
    if (user.email) return String(user.email)
  }
  return String(user)
}

export const getKey = (base, user) => `${base}_${getUserId(user)}`

export const storage = {
  getItem: (base, user) => {
    try {
      return localStorage.getItem(getKey(base, user))
    } catch (e) {
      return null
    }
  },
  setItem: (base, user, value) => {
    try {
      localStorage.setItem(getKey(base, user), value)
    } catch (e) {
      // ignore
    }
  },
  removeItem: (base, user) => {
    try {
      localStorage.removeItem(getKey(base, user))
    } catch (e) {
      // ignore
    }
  },
}
