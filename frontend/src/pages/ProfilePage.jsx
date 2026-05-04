import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getT, getLanguageName } from '../i18n/translations'
import { logger } from '../utils/logger'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Figma Image Assets
const imgMainContentArea = '/images/Main Content Area.png'
const imgBackgroundShadow = '../../public/images/Background+Shadow.png'
const imgKamalPerera = 'https://www.figma.com/api/mcp/asset/d3143544-f212-4162-af7d-4f6e3f3780f5'
const imgContainer = 'https://www.figma.com/api/mcp/asset/ed79a487-6682-41d6-a255-765920037108'
const imgContainer1 = 'https://www.figma.com/api/mcp/asset/b04e8ef4-8bfd-4795-a519-9e125c9b5ba5'
const imgContainer2 = 'https://www.figma.com/api/mcp/asset/10083670-1835-4498-9a0d-a9f278a3b9ab'
const imgContainer3 = 'https://www.figma.com/api/mcp/asset/cb5cdb2f-91ff-4791-b8aa-08cb4087597f'
const imgContainer4 = 'https://www.figma.com/api/mcp/asset/37f9fbfb-a027-40ec-8af7-49632c55d5c7'
const imgContainer8 = 'https://www.figma.com/api/mcp/asset/7145bf72-4d60-48db-a0be-2e412922a067'
const imgContainer9 = 'https://www.figma.com/api/mcp/asset/416b9949-5751-4ddd-b8ba-c4110ce1ca23'
const imgContainer10 = 'https://www.figma.com/api/mcp/asset/e58dfc38-0628-4f5f-9c57-05e1c54469e4'
const imgContainer11 = 'https://www.figma.com/api/mcp/asset/e85d0326-5489-43f2-9ead-7f0ee61e16b7'
const imgContainer12 = 'https://www.figma.com/api/mcp/asset/5d48bb1d-9b5f-4b12-a60b-edeaf06eea30'
const imgContainer13 = 'https://www.figma.com/api/mcp/asset/50964100-40a7-4e71-8736-b43e1f50ec39'
const imgContainer14 = 'https://www.figma.com/api/mcp/asset/a2a81246-00ab-4ed6-9841-16e6c278269c'
const imgContainer15 = 'https://www.figma.com/api/mcp/asset/ebc36865-032b-45e8-b6b8-ecec79ce0dff'
const imgContainer16 = 'https://www.figma.com/api/mcp/asset/04b88f66-83e8-42bd-b73d-8f56a392b624'
const imgContainer17 = 'https://www.figma.com/api/mcp/asset/ace30cc3-a274-4eb4-a5b9-229fd062859e'
const plant = '../../public/icons/plant.png'
const Phone = '../../public/icons/call_g.png'
const Setting = '../../public/icons/setting.png'
const P_2 = '../../public/icons/p_2.png'
const P_1 = '../../public/icons/p_1.png'
const Logout_R = '../../public/icons/logout_r.png'
const Profile_G = '../../public/icons/Profile.png'
const Location = '../../public/icons/location_G.png'
const Plant = '../../public/icons/plant.png'
const Phone_G = '../../public/icons/call_g.png'
const Mail = '../../public/icons/mail.png'


export default function ProfilePage() {
  const { user, signOut, language, updateLanguage } = useAuth()
  const t = getT(language)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [diseaseAlertsEnabled, setDiseaseAlertsEnabled] = useState(true)
  const [frostAlertsEnabled, setFrostAlertsEnabled] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfileData()
  }, [user])

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    logger.info('ProfilePage: Fetching profile data')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        logger.warn('ProfilePage: No token found')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      logger.info('ProfilePage: Profile data loaded', { email: data.email })
      setProfileData(data)
      setSelectedLanguage(data.profile?.language || language)
    } catch (error) {
      logger.error('ProfilePage', 'Error fetching profile', { message: error.message })
      toast.error(t('failedLoadProfile'))
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang)
    updateLanguage(lang)
  }

  const userName = profileData?.profile?.full_name || user?.user_metadata?.full_name || 'User'
  const plantationName = profileData?.profile?.plantation_name || 'Your Plantation'
  const userLocation = profileData?.profile?.location || 'Location not set'
  const getInitials = (fullName) => {
    if (!fullName) return 'U'
    const names = fullName.trim().split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image')
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/profile/upload-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Upload failed')
      }

      const data = await response.json()
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_photo_url: data.profile_photo_url,
        },
      }))
      toast.success('Profile photo updated successfully!')
      logger.info('ProfilePage: Profile photo uploaded')
    } catch (error) {
      logger.error('ProfilePage', 'Profile photo upload error', { message: error.message })
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      logger.info('ProfilePage: User logging out')
      await signOut()
      navigate('/login')
    } catch (error) {
      logger.error('ProfilePage', 'Logout error', { message: error.message })
      toast.error(t('logoutFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative">
        {/* Background */}


        {/* Page Content */}
        <div className="overflow-y-auto flex-1 relative z-5 flex flex-col">
          <div className="flex flex-col gap-10 px-20 py-8">
            {/* Profile Hero Section */}
            <div className="rounded-[24px] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_2px_10px_-6px_rgba(0,0,0,0.1)] relative">
              <img alt="" className="absolute inset-0 w-full h-full object-cover" src={imgBackgroundShadow} />
              <div className="absolute bg-[rgba(255,255,255,0.05)] blur-[32px] right-[-79.66px] rounded-full w-64 h-64 top-[-80px]" />

              <div className="relative z-10 flex gap-10 items-center p-12">
                {/* Avatar */}
                <div
                  onClick={handleProfilePhotoClick}
                  className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] border-4 border-[rgba(255,255,255,0.2)] rounded-[24px] p-2 flex-shrink-0 w-32 h-32 cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-all relative group"
                >
                  <div className="w-full h-full rounded-[16px] overflow-hidden bg-gradient-to-br from-[#1b6d24] to-[#00450d] flex items-center justify-center">
                    {profileData?.profile?.profile_photo_url ? (
                      <img alt="Profile" className="w-full h-full object-cover" src={profileData.profile.profile_photo_url} />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {getInitials(userName)}
                      </span>
                    )}
                  </div>

                  {/* Upload Overlay */}
                  <div className="absolute inset-2 rounded-[14px] bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />

                {/* Profile Info */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-[#724900] inline-flex items-center px-3 py-1 rounded-full w-fit">
                    <p className="text-[#ffddb5] text-xs font-semibold tracking-widest uppercase">ELITE TIER CULTIVATOR</p>
                  </div>

                  <h1 className="text-4xl font-extrabold text-black leading-tight">{userName}</h1>

                  <p className="text-[#91d78a] text-lg font-medium">{userLocation}</p>

                  {uploading && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 bg-[#91d78a] rounded-full animate-pulse"></div>
                      <p className="text-[#91d78a] text-sm font-medium">Uploading photo...</p>
                    </div>
                  )}

                  {/* <button className="bg-white inline-flex items-center gap-2 px-6 py-2.5 rounded-[12px] mt-4 w-fit hover:shadow-lg transition-all">
                    <img alt="" className="w-4 h-4" src={imgContainer7} />
                    <span className="text-[#00450d] font-semibold text-base">Edit Profile</span>
                  </button> */}
                </div>
              </div>
            </div>

            {/* Main Grid: Plantation Details & App Settings */}
            <div className="grid grid-cols-2 gap-10">
              {/* Left Column: Plantation Details */}
              <div className="flex flex-col gap-6">
                <div className="flex gap-2 items-center">
                  <img alt="" className="w-5 h-5" src={Plant} />
                  <h2 className="text-2xl font-bold text-[#1a1c1a]">{t('plantationDetails')}</h2>
                </div>

                <div className="space-y-4">
                  {/* Location Card */}
                  <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex gap-6 items-center">
                    <div className="bg-[#f4f3f1] rounded-[16px] w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <img alt="" className="w-4 h-4" src={Location} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[0.5px]">{t('location')}</p>
                      <h3 className="text-[#1a1c1a] text-lg font-semibold mt-1">{plantationName}</h3>
                      <p className="text-[#78716c] text-sm mt-1">{userLocation}</p>
                    </div>
                    {/* <button className="flex-shrink-0 hover:bg-[#f4f3f1] p-2 rounded-lg transition-all">
                      <img alt="" className="w-4 h-4" src={imgContainer10} />
                    </button> */}
                  </div>

                  {/* Email Card */}
                  <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex gap-6 items-center">
                    <div className="bg-[#f4f3f1] rounded-[16px] w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <img alt="" className="w-4 h-4" src={Mail} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[0.5px]">{t('email')}</p>
                      <h3 className="text-[#1a1c1a] text-lg font-semibold mt-1">{profileData?.email || 'Not available'}</h3>
                    </div>
                    <div className="bg-[#a0f399] text-[#217128] text-xs font-semibold px-4 py-1 rounded-full flex-shrink-0">
                      {t('verified')}
                    </div>
                  </div>

                  {/* Role Card */}
                  <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex gap-6 items-center">
                    <div className="bg-[#f4f3f1] rounded-[16px] w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <img alt="" className="w-5 h-5" src={Profile_G} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[0.5px]">{t('accountRole')}</p>
                      <h3 className="text-[#1a1c1a] text-lg font-semibold mt-1 capitalize">{profileData?.profile?.role || 'User'}</h3>
                    </div>
                    {/* <button className="flex-shrink-0 hover:bg-[#f4f3f1] p-2 rounded-lg transition-all">
                      <img alt="" className="w-5 h-5" src={Profile} />
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Right Column: App Settings */}
              <div className="flex flex-col gap-6">
                <div className="flex gap-2 items-center">
                  <img alt="" className="w-5 h-5" src={Setting} />
                  <h2 className="text-2xl font-bold text-[#1a1c1a]">{t('settings')}</h2>
                </div>

                <div className="bg-white rounded-[24px] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-8 space-y-8">
                  {/* Language Selection */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-widest">{t('displayLanguage')}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`${selectedLanguage === 'en' ? 'bg-[#00450d] text-white' : 'bg-[#f4f3f1] text-[#1a1c1a]'} font-semibold py-3 rounded-[12px] transition-all ${selectedLanguage === 'en' ? 'shadow-[0px_10px_15px_-3px_rgba(0,69,13,0.2),0px_4px_6px_-4px_rgba(0,69,13,0.2)]' : ''}`}
                      >
                        {getLanguageName('en')}
                      </button>
                      <button
                        onClick={() => handleLanguageChange('si')}
                        className={`${selectedLanguage === 'si' ? 'bg-[#00450d] text-white' : 'bg-[#f4f3f1] text-[#1a1c1a]'} font-bold py-3 rounded-[12px] transition-all ${selectedLanguage === 'si' ? 'shadow-[0px_10px_15px_-3px_rgba(0,69,13,0.2),0px_4px_6px_-4px_rgba(0,69,13,0.2)]' : ''}`}
                      >
                        {getLanguageName('si')}
                      </button>
                      <button
                        onClick={() => handleLanguageChange('ta')}
                        className={`${selectedLanguage === 'ta' ? 'bg-[#00450d] text-white' : 'bg-[#f4f3f1] text-[#1a1c1a]'} font-bold py-3 rounded-[12px] transition-all ${selectedLanguage === 'ta' ? 'shadow-[0px_10px_15px_-3px_rgba(0,69,13,0.2),0px_4px_6px_-4px_rgba(0,69,13,0.2)]' : ''}`}
                      >
                        {getLanguageName('ta')}
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(192,201,187,0.3)]" />

                  {/* Notifications & Alerts */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-widest">{t('notificationAlerts')}</p>

                    <div className="bg-[#f4f3f1] rounded-[16px] p-4 flex gap-3 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <img alt="" className="w-4 h-4" src={P_1} />
                        <p className="text-[#1a1c1a] font-medium">{t('diseaseDetectionAlerts')}</p>
                      </div>
                      <button
                        onClick={() => setDiseaseAlertsEnabled(!diseaseAlertsEnabled)}
                        className={`relative inline-flex h-6 w-12 rounded-full ${diseaseAlertsEnabled ? 'bg-[#1b6d24]' : 'bg-gray-300'} transition-all`}
                      >
                        <span className={`absolute top-1 left-1 inline-block h-4 w-4 rounded-full bg-white transition-transform ${diseaseAlertsEnabled ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>

                    <div className="bg-[#f4f3f1] rounded-[16px] p-4 flex gap-3 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <img alt="" className="w-2 h-4" src={P_2} />
                        <p className="text-[#1a1c1a] font-medium">{t('frostWarningNotifications')}</p>
                      </div>
                      <button
                        onClick={() => setFrostAlertsEnabled(!frostAlertsEnabled)}
                        className={`relative inline-flex h-6 w-12 rounded-full ${frostAlertsEnabled ? 'bg-[#1b6d24]' : 'bg-gray-300'} transition-all`}
                      >
                        <span className={`absolute top-1 left-1 inline-block h-4 w-4 rounded-full bg-white transition-transform ${frostAlertsEnabled ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="border-2 border-[rgba(186,26,26,0.2)] rounded-[16px] w-full py-4.5 flex gap-3 items-center justify-center hover:bg-[rgba(186,26,26,0.05)] transition-all disabled:opacity-50"
                  >
                    <img alt="" className="w-4 h-4" src={Logout_R} />
                    <span className="text-[#ba1a1a] font-semibold text-base">
                      {loading ? t('loggingOut') : t('logoutAccount')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e7e5e4] opacity-40 py-8 px-8 text-center">
            <p className="text-[#41493e] text-xs font-semibold tracking-[2px] uppercase">© 2026 SMARTTEACARE AGRONOMY AI</p>
          </div>
        </div>
    </div>
  )
}
