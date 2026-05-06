import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { logger } from '../utils/logger'

/**
 * Custom hook for making API calls with automatic token injection
 * Returns { data, error, loading, execute }
 */
export const useApi = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(
    async (apiFunction, ...args) => {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        const err = 'No authentication token found'
        setError(err)
        setLoading(false)
        return { data: null, error: err }
      }

      try {
        const result = await apiFunction(...args, token)

        if (result.error) {
          setError(result.error)
          logger.error('useApi', 'API call failed', result.error)
          return result
        }

        setData(result.data)
        return result
      } catch (err) {
        logger.error('useApi', 'Unexpected error', err)
        setError(err.message || 'An unexpected error occurred')
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { data, error, loading, execute }
}

export default useApi
