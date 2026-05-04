import { createContext, useContext, useState } from 'react'
import { logger } from '../utils/logger'

const AuthContext = createContext({})
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

logger.info('AuthContext: Using API URL', { API_URL })

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('profile')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })

  const signIn = async (email, password) => {
    try {
      logger.info('AuthContext: Signing in via backend', { email })
      setLoading(true)

      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('AuthContext', 'Sign in failed', { status: response.status, error })
        return { data: null, error: { message: error.detail || 'Sign in failed' } }
      }

      const data = await response.json()
      logger.auth('Sign in successful', { userId: data.user.id, email: data.user.email })

      // Store token and user
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('profile', JSON.stringify({ ...data.user, role: 'user', language }))

      setUser(data.user)
      setProfile({ ...data.user, role: 'user', language })
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

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          plantation_name: plantationName,
          location: location
        })
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('AuthContext', 'Sign up failed', { status: response.status, error })
        return { data: null, error: { message: error.detail || 'Sign up failed' } }
      }

      const data = await response.json()
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
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {
          // Signout endpoint might not exist, that's okay
        })
      }
    } catch (error) {
      logger.error('AuthContext', 'signOut error', { message: error.message })
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('profile')
      setUser(null)
      setProfile(null)
    }
  }

  const updateLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    if (profile) {
      const updated = { ...profile, language: lang }
      setProfile(updated)
      localStorage.setItem('profile', JSON.stringify(updated))
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
        isAuthenticated: !!user && !!localStorage.getItem('token'),
        isAdmin: profile?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
