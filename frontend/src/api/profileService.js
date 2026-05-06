import { API_URL, API_ENDPOINTS } from '../config/api.config'
import { logger } from '../utils/logger'

export const profileService = {
  /**
   * Update user profile (name, language, etc.)
   */
  updateProfile: async (updates, token) => {
    try {
      logger.info('Profile Service: Updating profile', updates)

      const response = await fetch(`${API_URL}${API_ENDPOINTS.PROFILE}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Profile Service', 'Update profile failed', error)
        return { data: null, error: error.detail || 'Failed to update profile' }
      }

      const data = await response.json()
      logger.info('Profile Service: Profile updated', { data: data.data })
      return { data: data.data, error: null }
    } catch (error) {
      logger.error('Profile Service', 'updateProfile', error)
      return { data: null, error: error.message }
    }
  },

  /**
   * Upload profile photo
   */
  uploadProfilePhoto: async (file, token) => {
    try {
      logger.imageUpload(file.name, file.size)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}${API_ENDPOINTS.PROFILE_UPLOAD_PHOTO}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('Profile Service', 'Upload photo failed', error)
        return { data: null, error: error.detail || 'Failed to upload photo' }
      }

      const data = await response.json()
      logger.info('Profile Service: Photo uploaded', { url: data.profile_photo_url })
      return { data, error: null }
    } catch (error) {
      logger.error('Profile Service', 'uploadProfilePhoto', error)
      return { data: null, error: error.message }
    }
  },
}

export default profileService
