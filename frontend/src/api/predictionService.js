import { API_URL, API_ENDPOINTS } from '../config/api.config'
import { logger } from '../utils/logger'

export const predictionService = {
  /**
   * Upload image and get disease prediction
   */
  predict: async (file, token) => {
    try {
      logger.info('Prediction Service: Uploading image for prediction')

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}${API_ENDPOINTS.PREDICT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Prediction Service', 'Prediction failed', error)
        return { data: null, error: error.detail || 'Prediction failed' }
      }

      const data = await response.json()
      logger.detection(data.disease, data.confidence)
      return { data, error: null }
    } catch (error) {
      logger.error('Prediction Service', 'predict', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Upload image, get prediction, and save to database
   */
  predictAndSave: async (file, token, options = {}) => {
    try {
      logger.info('Prediction Service: Uploading image and saving prediction')

      const formData = new FormData()
      formData.append('file', file)
      if (options.notes) formData.append('notes', options.notes)
      if (options.location) formData.append('location', options.location)
      if (options.imageUrl) formData.append('image_url', options.imageUrl)

      const response = await fetch(`${API_URL}${API_ENDPOINTS.PREDICT_AND_SAVE}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Prediction Service', 'Predict and save failed', error)
        return { data: null, error: error.detail || 'Prediction and save failed' }
      }

      const data = await response.json()
      logger.info('Prediction Service: Saved detection', { detectionId: data.saved_detection?.id })
      return { data, error: null }
    } catch (error) {
      logger.error('Prediction Service', 'predictAndSave', error)
      return { data: null, error: error.message }
    }
  },
}

export default predictionService
