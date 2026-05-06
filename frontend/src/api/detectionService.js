import { API_URL, API_ENDPOINTS } from '../config/api.config'
import { logger } from '../utils/logger'

export const detectionService = {
  /**
   * Get all detections for current user
   */
  getDetections: async (token) => {
    try {
      logger.info('Detection Service: Getting all detections')

      const response = await fetch(`${API_URL}${API_ENDPOINTS.DETECTIONS}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Detection Service', 'Get detections failed', error)
        return { data: null, error: error.detail || 'Failed to get detections' }
      }

      const data = await response.json()
      logger.info('Detection Service: Retrieved detections', { count: data.length })
      return { data, error: null }
    } catch (error) {
      logger.error('Detection Service', 'getDetections', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Get a single detection by ID
   */
  getDetection: async (detectionId, token) => {
    try {
      logger.info('Detection Service: Getting detection', { detectionId })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.DETECTION_BY_ID(detectionId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Detection Service', 'Get detection failed', error)
        return { data: null, error: error.detail || 'Detection not found' }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      logger.error('Detection Service', 'getDetection', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Save a detection manually
   */
  saveDetection: async (detection, token) => {
    try {
      logger.info('Detection Service: Saving detection', { disease: detection.disease })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.DETECTIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(detection),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Detection Service', 'Save detection failed', error)
        return { data: null, error: error.detail || 'Failed to save detection' }
      }

      const data = await response.json()
      logger.info('Detection Service: Detection saved', { detectionId: data.data?.id })
      return { data: data.data, error: null }
    } catch (error) {
      logger.error('Detection Service', 'saveDetection', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Delete a detection
   */
  deleteDetection: async (detectionId, token) => {
    try {
      logger.info('Detection Service: Deleting detection', { detectionId })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.DETECTION_BY_ID(detectionId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Detection Service', 'Delete detection failed', error)
        return { error: error.detail || 'Failed to delete detection' }
      }

      logger.info('Detection Service: Detection deleted', { detectionId })
      return { error: null }
    } catch (error) {
      logger.error('Detection Service', 'deleteDetection', error)
      return { error: error.message }
    }
  },
}

export default detectionService
