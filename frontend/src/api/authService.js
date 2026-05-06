import { API_URL, API_ENDPOINTS, HTTP_HEADERS } from '../config/api.config'
import { logger } from '../utils/logger'

export const authService = {
  /**
   * Sign up a new user
   */
  signup: async (email, password, fullName, plantationName = '', location = '') => {
    try {
      logger.info('Auth Service: Signing up', { email, fullName })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: HTTP_HEADERS.JSON,
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          plantation_name: plantationName,
          location,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Auth Service', 'Signup failed', error)
        return { data: null, error: error.detail || 'Signup failed' }
      }

      const data = await response.json()
      logger.auth('Signup successful', { userId: data.user.id })
      return { data, error: null }
    } catch (error) {
      logger.error('Auth Service', 'signup', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Sign in a user
   */
  signin: async (email, password) => {
    try {
      logger.info('Auth Service: Signing in', { email })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.SIGNIN}`, {
        method: 'POST',
        headers: HTTP_HEADERS.JSON,
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Auth Service', 'Signin failed', error)
        return { data: null, error: error.detail || 'Signin failed' }
      }

      const data = await response.json()
      logger.auth('Signin successful', { userId: data.user.id })
      return { data, error: null }
    } catch (error) {
      logger.error('Auth Service', 'signin', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Sign out a user
   */
  signout: async (token) => {
    try {
      logger.info('Auth Service: Signing out')

      await fetch(`${API_URL}${API_ENDPOINTS.AUTH.SIGNOUT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {
        // Signout endpoint might fail, that's okay
      })

      return { error: null }
    } catch (error) {
      logger.error('Auth Service', 'signout', error)
      return { error: error.message }
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email, redirectUrl = null) => {
    try {
      logger.info('Auth Service: Requesting password reset', { email })

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: HTTP_HEADERS.JSON,
        body: JSON.stringify({
          email,
          redirect_url: redirectUrl || `${window.location.origin}/reset-password`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Auth Service', 'Forgot password failed', error)
        return { data: null, error: error.detail || 'Failed to send reset email' }
      }

      const data = await response.json()
      logger.info('Auth Service: Reset email sent', { email })
      return { data, error: null }
    } catch (error) {
      logger.error('Auth Service', 'forgotPassword', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (token) => {
    try {
      logger.info('Auth Service: Getting current user')

      const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Auth Service', 'Get current user failed', error)
        return { data: null, error: error.detail || 'Failed to get user' }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      logger.error('Auth Service', 'getCurrentUser', error)
      return { data: null, error: error.message }
    }
  },
}

export default authService
