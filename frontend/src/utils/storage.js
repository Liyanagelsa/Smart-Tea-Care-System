import { STORAGE_KEYS } from '../config/constants'

/**
 * Local Storage utilities for managing user session and preferences
 */

export const storage = {
  // Token management
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

  // User management
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  },
  setUser: (user) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(STORAGE_KEYS.USER),

  // Profile management
  getProfile: () => {
    const profile = localStorage.getItem(STORAGE_KEYS.PROFILE)
    return profile ? JSON.parse(profile) : null
  },
  setProfile: (profile) => localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)),
  removeProfile: () => localStorage.removeItem(STORAGE_KEYS.PROFILE),

  // Language management
  getLanguage: () => localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en',
  setLanguage: (lang) => localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang),

  // Clear all
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  },

  // Auth session
  getAuthSession: () => ({
    token: storage.getToken(),
    user: storage.getUser(),
    profile: storage.getProfile(),
    language: storage.getLanguage(),
  }),

  setAuthSession: (token, user, profile, language = 'en') => {
    storage.setToken(token)
    storage.setUser(user)
    storage.setProfile({ ...user, role: 'user', language })
    storage.setLanguage(language)
  },

  clearAuthSession: () => {
    storage.removeToken()
    storage.removeUser()
    storage.removeProfile()
  },
}

export default storage
