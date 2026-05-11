import { createContext, useState } from 'react'
import { logger } from '../utils/logger'
import { storage } from '../utils/storage'
import { authService } from '../api/authService'

export const AuthContext = createContext({})
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

logger.info('AuthContext: Using API URL', { API_URL })

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser())
  const [profile, setProfile] = useState(() => storage.getProfile())
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState(() => storage.getLanguage())

  const signIn = async (email, password) => {
    try {
      logger.info('AuthContext: Signing in via backend', { email })
      setLoading(true)

      const { data, error } = await authService.signin(email, password)

      if (error) {
        return { data: null, error: { message: error } }
      }

      // Store token and user
      storage.setAuthSession(data.access_token, data.user, data.user, language)

      setUser(data.user)
      setProfile({ ...data.user, role: data.user?.role || 'user', language })
      return { data, error: null }
    } catch (error) {
      logger.error('AuthContext', 'signIn error', { message: error.message })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName, plantationName = '', location = '') => {
    try {
      logger.info('AuthContext: Signing up via backend', { email, fullName })
      setLoading(true)

      const { data, error } = await authService.signup(
        email,
        password,
        fullName,
        plantationName,
        location
      )

      if (error) {
        return { data: null, error: { message: error } }
      }

      logger.info('Sign up successful', { userId: data.user.id })
      return { data, error: null }
    } catch (error) {
      logger.error('AuthContext', 'signUp error', { message: error.message })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      logger.info('AuthContext: Signing out')
      const token = storage.getToken()
      if (token) {
        await authService.signout(token)
      }
    } catch (error) {
      logger.error('AuthContext', 'signOut error', { message: error.message })
    } finally {
      storage.clearAuthSession()
      setUser(null)
      setProfile(null)
    }
  }

  const updateLanguage = (lang) => {
    setLanguage(lang)
    storage.setLanguage(lang)
    if (profile) {
      const updated = { ...profile, language: lang }
      setProfile(updated)
      storage.setProfile(updated)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        language,
        signIn,
        signUp,
        signOut,
        updateLanguage,
        isAuthenticated: !!user && !!storage.getToken(),
        isAdmin: profile?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
