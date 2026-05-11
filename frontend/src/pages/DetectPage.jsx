import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import { getT } from '../i18n/translations'
import { getTreatment } from '../i18n/treatmentTranslations'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { logger } from '../utils/logger'
import { supabase } from '../utils/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

logger.info('DetectPage initialized', { API_URL })

// Figma Image Assets
const imgMainContentArea = '/images/Main Content Area.png'
const imgAgronomistProfile = 'https://www.figma.com/api/mcp/asset/fc75bf1f-a8c1-4504-8a7d-6780d2c1b7d0'
const imgContainer = 'https://www.figma.com/api/mcp/asset/b1b248e6-ad7b-4fab-8fde-943fe4ec155c'
const imgContainer1 = 'https://www.figma.com/api/mcp/asset/ddb6e7f9-ace9-477b-9fd9-9a6f55f3d37f'
const imgContainer2 = 'https://www.figma.com/api/mcp/asset/4e90d1ef-5e49-4bea-af5b-6069caaf6e10'
const imgContainer3 = 'https://www.figma.com/api/mcp/asset/c8c4c7fd-2ab0-4b96-b868-45915399b007'
const imgContainer4 = 'https://www.figma.com/api/mcp/asset/44adbe9b-ba81-40bb-8aee-56be917e3b24'
const imgContainer5 = 'https://www.figma.com/api/mcp/asset/4411459a-c2f9-4265-8d6d-36b4009e141f'
const imgContainer6 = 'https://www.figma.com/api/mcp/asset/d23143e1-23dc-41e6-a71c-6032570c765c'
const imgContainer7 = 'https://www.figma.com/api/mcp/asset/5e99b46a-5f18-40e9-b950-c787bda32e9f'
const imgContainer8 = 'https://www.figma.com/api/mcp/asset/43f56222-aa6a-4354-9028-7a343fb9b418'
const imgContainer9 = 'https://www.figma.com/api/mcp/asset/ec05373c-87c9-4f09-b3f8-36d164d2d6c2'
const imgContainer10 = 'https://www.figma.com/api/mcp/asset/ccbd64c8-1f34-4dbf-b93f-5d182ceafa47'
const imgContainer11 = 'https://www.figma.com/api/mcp/asset/d5c26617-8f4a-4894-bad5-0b5c0817ab5a'
const imgContainer12 = 'https://www.figma.com/api/mcp/asset/672d73be-d4e8-4369-bf71-eeb32e5cd698'
const imgContainer13 = 'https://www.figma.com/api/mcp/asset/f6270c3b-f040-4802-82b9-a19f28acb2e7'
const Gallery = '../../public/icons/Gallery.png'
const Retake = '../../public/icons/Retake.png'
const D_1 = '../../public/icons/D_1.png'
const D_2 = '../../public/icons/D_2.png'
const D_3 = '../../public/icons/D_3.png'
const Analyze = '../../public/icons/analyze.png'
const Overview = '../../public/icons/Overview.png'
const Organic = '../../public/icons/Organic.png'
const Chemical = '../../public/icons/Chemical.png'
const Save = '../../public/icons/Save.png'
const Scan = '../../public/icons/Scan.png'

const DISEASE_INFO = {
  'Algal Leaf Spot': {
    scientificName: 'Cephaleuros virescens',
    overview: {
      en: 'Algal Leaf Spot is caused by the parasitic green alga Cephaleuros virescens. It appears as circular, orange-red or rusty patches on leaf surfaces and can reduce photosynthesis, weakening the plant over time if left unmanaged.',
      si: 'ඇල්ගල් ලීෆ් ස්පොට් රෝගය Cephaleuros virescens නම් ශාකශාකී ශාකයෙකු නිසා ඇති වේ. ශාක පත්‍ර මතු මතුපිට රවුම් හෝ දිලිර ලප ඇති කරයි. නිසි ලෙස ප්‍රතිකාර නොකළ හොත් ශාකයේ ප්‍රකාශ සංස්ලේෂණය අඩු කර ශාකය දුර්වල කරයි.',
      ta: 'ஆல்கல் இலை புள்ளி நோய் Cephaleuros virescens என்ற பாசி தாவரத்தால் உண்டாகிறது. இது இலை மேற்பரப்பில் வட்டமான, ஆரஞ்சு-சிவப்பு அல்லது துருப்பிடித்த திட்டுகளாக தோன்றும். சரியான சிகிச்சை இல்லாவிட்டால் ஒளிச்சேர்க்கையை குறைத்து தாவரத்தை பலவீனப்படுத்தும்.',
    },
    spreadPotentialKey: 'moderate',
  },
  'Brown Blight': {
    scientificName: 'Colletotrichum camelliae',
    overview: {
      en: 'Brown Blight is a serious fungal disease caused by Colletotrichum camelliae. It causes dark brown lesions on young leaves and shoots, leading to significant crop loss if left untreated during humid seasons.',
      si: 'දුඹුරු රෝගය Colletotrichum camelliae නම් දිලිරයෙකු නිසා ඇති වන බරපතල රෝගයකි. තරුණ පත්‍ර සහ අංකුර මත දුඹුරු ලප ඇති කරයි. ජල කාලගුණ සමයේ ප්‍රතිකාර නොකළ හොත් අස්වනු හානිය සැලකිය යුතු ලෙස ඇති වේ.',
      ta: 'பழுப்பு கருகல் நோய் Colletotrichum camelliae என்ற பூஞ்சையால் உண்டாகும் ஒரு தீவிரமான நோயாகும். இளம் இலைகள் மற்றும் தளிர்களில் கரும்பழுப்பு புண்களை ஏற்படுத்தும். ஈரமான பருவகாலத்தில் சிகிச்சை அளிக்காவிட்டால் கணிசமான பயிர் இழப்பு ஏற்படும்.',
    },
    spreadPotentialKey: 'high',
  },
  'Gray Blight': {
    scientificName: 'Pestalotiopsis theae',
    overview: {
      en: 'Gray Blight is caused by the fungus Pestalotiopsis theae. It produces gray-brown leaf spots with a distinct margin and can rapidly spread across the canopy in wet conditions, reducing overall harvest quality.',
      si: 'අළු රෝගය Pestalotiopsis theae නම් දිලිරයෙකු නිසා ඇති වේ. ශාක පත්‍ර මත අළු-දුඹුරු ලප ඇති කරයි. තෙත් කාලගුණ තත්ත්ව යටතේ ශාකයේ ආවරණය හරහා ඉක්මනින් පැතිරෙන අතර අස්වනු ගුණත්වය අඩු කරයි.',
      ta: 'சாம்பல் கருகல் நோய் Pestalotiopsis theae என்ற பூஞ்சையால் ஏற்படுகிறது. இது தெளிவான விளிம்புடன் சாம்பல்-பழுப்பு இலை புள்ளிகளை உற்பத்தி செய்கிறது. ஈரமான நிலைமைகளில் விரைவாக பரவி ஒட்டுமொத்த அறுவடை தரத்தை குறைக்கும்.',
    },
    spreadPotentialKey: 'high',
  },
  'Healthy': {
    scientificName: '',
    overview: {
      en: 'No disease detected. The leaf appears healthy with no visible signs of fungal, bacterial, or pest damage. Continue regular agronomic practices to maintain crop health and monitor plants periodically.',
      si: 'රෝගයක් හඳුනා නොගනී. ශාක පත්‍රය දිලිර, බැක්ටීරියා හෝ කෘමි හානි නොමැතිව සෞඛ්‍ය සම්පන්නව දිස් වේ. අස්වනු සෞඛ්‍යය පවත්වා ගැනීමට සාමාන්‍ය ගොවිතැන් ක්‍රම ඉදිරිපත් කරන්න.',
      ta: 'நோய் எதுவும் கண்டறியப்படவில்லை. இலை பூஞ்சை, பாக்டீரியா அல்லது பூச்சி சேதத்தின் எந்த அறிகுறியும் இல்லாமல் ஆரோக்கியமாக தோன்றுகிறது. பயிர் ஆரோக்கியத்தை பராமரிக்க வழக்கமான விவசாய நடைமுறைகளை தொடரவும்.',
    },
    spreadPotentialKey: 'none',
  },
  'Helopeltis': {
    scientificName: 'Helopeltis theivora',
    overview: {
      en: 'Helopeltis (Tea Mosquito Bug) damage is caused by the insect Helopeltis theivora. The pest punctures tender shoots and leaves causing dark lesions and dieback. Severe infestations can cause significant yield and quality losses.',
      si: 'හෙලොපෙල්ටිස් (තේ මදුරු පළිබෝධ) Helopeltis theivora නම් කෘමියෙකු නිසා ඇති වේ. තරුණ අංකුර සහ පත්‍ර ඇනීම් නිසා අඳුරු ලප හා ශාකය මිය යාම සිදු වේ. දැඩි ප්‍රහාර නිසා සැලකිය යුතු අස්වනු සහ ගුණත්ව හානි ඇති විය හැකිය.',
      ta: 'ஹெலோபெல்டிஸ் (தேயிலை கொசு பூச்சி) சேதம் Helopeltis theivora என்ற பூச்சியால் ஏற்படுகிறது. பூச்சி இளம் தளிர்கள் மற்றும் இலைகளை குத்தி கரும்புண்கள் மற்றும் இறப்பை ஏற்படுத்தும். கடுமையான தாக்குதல்கள் கணிசமான மகசூல் மற்றும் தர இழப்புகளை ஏற்படுத்தும்.',
    },
    spreadPotentialKey: 'high',
  },
  'Red Leaf Spot': {
    scientificName: 'Didymella exitialis',
    overview: {
      en: 'Red Leaf Spot is a fungal disease caused by Didymella exitialis. It manifests as reddish-brown circular spots on mature leaves. Wet and humid conditions accelerate its spread throughout the plantation.',
      si: 'රතු ලප රෝගය Didymella exitialis නම් දිලිරයෙකු නිසා ඇති වේ. මෝළ පත්‍ර මත රතු-දුඹුරු රවුම් ලප ලෙස ප්‍රකාශ වේ. තෙත් සහ ආර්ද්‍ර තත්ත්ව යටතේ ව්‍යාප්තිය ත්වරණය වේ.',
      ta: 'சிவப்பு இலை புள்ளி நோய் Didymella exitialis என்ற பூஞ்சையால் ஏற்படுகிறது. முதிர்ந்த இலைகளில் சிவப்பு-பழுப்பு வட்ட புள்ளிகளாக வெளிப்படும். ஈரமான மற்றும் ஈரப்பதமான நிலைமைகள் தோட்டம் முழுவதும் பரவுவதை துரிதப்படுத்தும்.',
    },
    spreadPotentialKey: 'moderate',
  },
}

export default function DetectPage() {
  const { user, language } = useAuth()
  const navigate = useNavigate()
  const t = getT(language)
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastAnalysis, setLastAnalysis] = useState(null)
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User'

  useEffect(() => {
    const fetchLastAnalysis = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await fetch(`${API_URL}/detections`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) setLastAnalysis(data[0])
        }
      } catch (_) {}
    }
    fetchLastAnalysis()
  }, [user])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    logger.debug('onDrop triggered', { acceptedFilesCount: acceptedFiles.length })

    if (!file) {
      logger.warn('No file selected in onDrop')
      return
    }

    logger.imageUpload(file.name, file.size)
    setImageFile(file)
    setImage(URL.createObjectURL(file))
    setResult(null)
    setProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  const analyze = async () => {
    if (!imageFile) {
      logger.warn('Analyze called but no imageFile present')
      return
    }

    logger.info('Starting analysis...', { fileName: imageFile.name })
    setLoading(true)
    setAnalyzing(true)
    setResult(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const token = localStorage.getItem('token')
      logger.debug('API call setup', { url: `${API_URL}/predict`, hasToken: !!token })

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = t('analysisFailed')

        try {
          const errorData = await response.json()
          // Check if error response has a detail field (FastAPI format)
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch (parseError) {
          // If JSON parsing fails, try text
          try {
            const errorText = await response.text()
            logger.error('DetectPage', 'API error response', { status: response.status, error: errorText })
          } catch (e) {
            // Ignore text parsing errors
          }
        }

        logger.error('DetectPage', 'API error', { status: response.status, message: errorMessage })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      logger.info('Analysis complete', { disease: data.disease, confidence: data.confidence })

      setResult(data)
      setProgress(100)
      toast.success(`${data.disease} ${t('diseaseDetected')}`)
      setLastAnalysis({ disease: data.disease, confidence: data.confidence, image_url: image, created_at: new Date().toISOString() })
    } catch (error) {
      logger.error('DetectPage', 'Analysis failed', { message: error.message })
      toast.error(error.message || t('analysisFailed'))

      // Reset image and state on error
      setImage(null)
      setImageFile(null)
      setResult(null)
      setProgress(0)
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const saveToHistory = async () => {
    if (!result || !imageFile) {
      toast.error(t('noDetectionResult'))
      return
    }

    try {
      setLoading(true)
      logger.info('Saving detection to history...', { disease: result.disease })

      let imageUrl = null

      try {
        const fileName = `${Date.now()}_${imageFile.name}`
        const { data, error: uploadError } = await supabase.storage
          .from('leaf-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          logger.warn('Failed to upload image to storage, continuing without image URL', { error: uploadError.message })
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('leaf-images')
            .getPublicUrl(fileName)
          imageUrl = publicUrl
          logger.info('Image uploaded successfully', { imageUrl })
        }
      } catch (storageError) {
        logger.warn('Storage upload error, continuing without image', { message: storageError.message })
      }

      const token = localStorage.getItem('token')
      const payload = {
        image_url: imageUrl,
        disease: result.disease,
        confidence: result.confidence,
        severity_level: result.severity?.level || 'Unknown',
        severity_score: result.severity?.score || 0,
        treatment: result.treatment || {},
        all_probabilities: result.all_probabilities || {},
        model: result.model || 'ResNet50'
      }

      const response = await fetch(`${API_URL}/detections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('DetectPage', 'Save detection failed', { status: response.status, error: errorText })
        throw new Error(`Failed to save detection: ${response.status}`)
      }

      logger.info('Detection saved successfully')
      toast.success(t('detectionSavedSuccess'))
      setTimeout(() => navigate('/history'), 500)
    } catch (error) {
      logger.error('DetectPage', 'Save to history failed', { message: error.message })
      toast.error(t('detectionSaveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setImage(null)
    setImageFile(null)
    setResult(null)
    setProgress(0)
    setAnalyzing(false)
  }

  const handleLogout = async () => {
    try {
      logger.info('DetectPage: User logging out')
      await signOut()
      navigate('/login')
    } catch (error) {
      logger.error('DetectPage', 'Logout error', { message: error.message })
    }
  }

  // Results View
  if (result) {
    const getSeverityInfo = (confidence) => {
      if (confidence >= 85) return { level: 'Severe', color: '#ba1a1a' }
      if (confidence >= 65) return { level: 'Medium', color: '#533400' }
      return { level: 'Mild', color: '#1c5f20' }
    }

    const severityInfo = getSeverityInfo(result.confidence)

    return (
      <div className="flex-1 min-h-screen flex flex-col relative">
          {/* Background */}
          <img src={imgMainContentArea} alt="Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

          {/* Results Content */}
          <div className="overflow-y-auto flex-1 relative z-5 flex flex-col">
            <div className="flex flex-col gap-12 px-20 py-8">
              {/* Header */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-xs font-medium text-[#41493e] tracking-wider uppercase">
                    <span>{t('analytics')}</span>
                    <span>/</span>
                    <span className="text-[#00450d] font-semibold">{t('detectionResults')}</span>
                  </div>
                  <h1 className="text-[#1a1c1a] text-5xl font-extrabold tracking-[-1.2px]">{t('analysisResults')}</h1>
                </div>
                <p className="text-[#41493e] text-xs italic">{t('scannedOn')} {new Date().toLocaleDateString()}</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  {/* Image with Overlay */}
                  <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)]">
                    <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                      <img src={image} alt="Detected leaf" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,28,26,0.4)] to-transparent opacity-60" />
                      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                        <div className={`px-4 py-1.5 rounded-full w-fit ${result.disease === 'Healthy' ? 'bg-[#1b6d24]' : 'bg-[#ba1a1a]'}`}>
                          <p className="text-xs font-bold text-white tracking-[1.2px] uppercase">
                            {result.disease === 'Healthy' ? t('healthy') : t('infected')}
                          </p>
                        </div>
                        <h2 className="text-white text-xl font-bold drop-shadow-lg">{result.disease}</h2>
                        {DISEASE_INFO[result.disease]?.scientificName && (
                          <p className="text-white/70 text-xs italic">{DISEASE_INFO[result.disease].scientificName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Disease Overview */}
                  <div className="bg-[#f4f3f1] rounded-[12px] p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <img alt="" className="block w-5 h-5" src={Overview} />
                      <h3 className="text-[#1a1c1a] text-lg font-bold">{t('diseaseOverview')}</h3>
                    </div>
                    <p className="text-[#41493e] text-sm leading-[22px]">
                      {DISEASE_INFO[result.disease]?.overview?.[language]
                        || DISEASE_INFO[result.disease]?.overview?.en
                        || `${result.disease} detected. Please consult an agronomist for treatment recommendations.`}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-5 flex flex-col gap-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-[12px] border-b-4 border-[#1b6d24] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex flex-col gap-3">
                      <p className="text-xs font-normal text-[#41493e] tracking-[1.2px] uppercase">{t('confidenceLabel')}</p>
                      <p className="text-3xl font-semibold text-[#1b6d24]">{result.confidence.toFixed(0)}%</p>
                      <p className="text-xs text-[#41493e]">{t('matchAccuracy')}</p>
                    </div>

                    <div className="bg-white rounded-[12px] border-b-4 border-[#533400] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex flex-col gap-3">
                      <p className="text-xs font-normal text-[#41493e] tracking-[1.2px] uppercase">{t('severityLabel')}</p>
                      <p className="text-3xl font-semibold text-[#533400]">{result.severity_level || 'None'}</p>
                      <p className="text-xs text-[#41493e]">{t('spreadPotential')}: {t(DISEASE_INFO[result.disease]?.spreadPotentialKey) || '-'}</p>
                    </div>
                  </div>

                  {/* Treatment Section */}
                  <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(26,28,26,0.08)] p-8 flex flex-col gap-8">
                    <h3 className="text-[#1a1c1a] text-2xl font-extrabold tracking-[-0.6px]">{t('treatmentRecommendations')}</h3>

                    {/* Organic Approach */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 items-center">
                        <img alt="" className="block w-4 h-4" src={Organic} />
                        <p className="text-[#00450d] text-xs font-semibold tracking-[2.4px] uppercase">{t('organicApproach')}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(getTreatment(language, result.disease)?.organic || []).map((step, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="bg-[#00450d] rounded-full w-1.5 h-1.5 mt-2.5 flex-shrink-0" />
                            <p className="text-[#41493e] text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chemical Control */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 items-center">
                        <img alt="" className="block w-4 h-4" src={Chemical} />
                        <p className="text-[#533400] text-xs font-semibold tracking-[2.4px] uppercase">{t('chemicalControl')}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(getTreatment(language, result.disease)?.chemical || []).map((step, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="bg-[#533400] rounded-full w-1.5 h-1.5 mt-2.5 flex-shrink-0" />
                            <p className="text-[#41493e] text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={saveToHistory}
                        disabled={loading}
                        className="bg-[#00450d] text-white px-6 py-4 rounded-[12px] font-semibold flex items-center gap-2 hover:bg-[#003008] transition-all disabled:opacity-50 shadow-[0px_10px_15px_-3px_rgba(0,69,13,0.2),0px_4px_6px_-4px_rgba(0,69,13,0.2)]"
                      >
                        <img alt="" className="block w-4 h-4" src={Save} />
                        <div className="flex flex-col text-xs">
                          <span>{t('save')}</span>
                          <span>{t('next')}</span>
                          <span>{t('historyTitle')}</span>
                        </div>
                      </button>
                      <button
                        onClick={handleRetake}
                        className="border-2 border-[#c0c9bb] text-[#1a1c1a] px-8 py-4 rounded-[12px] font-semibold flex items-center gap-3 hover:bg-gray-50 transition-all"
                      >
                        <img alt="" className="block w-4 h-4" src={Scan} />
                        <div className="flex flex-col text-xs">
                          <span>{t('add')}</span>
                          <span>{t('detect')}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#e7e5e4] opacity-40 py-8 px-8 text-center">
              <p className="text-[#41493e] text-xs font-semibold tracking-[2px] uppercase">© 2024 SMARTTEACARE AGRONOMY AI</p>
            </div>
          </div>
      </div>
    )
  }

  // Detect/Scanning View
  return (
    <div className="flex-1 min-h-screen flex flex-col relative">
        {/* Background */}
        <img src={imgMainContentArea} alt="Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        {/* Page Content */}
        <div className="overflow-y-auto flex-1 relative z-5 flex flex-col">
          <div className="flex flex-col gap-12 px-20 py-8">
            {/* Title Section */}
            <div className="mb-4">
              <h1 className="text-[#00450d] text-5xl font-bold">{t('detectTitle')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left: Analysis Area */}
              <div className="md:col-span-7 flex flex-col gap-6">
                {/* Instructions */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#0f172a] text-xl font-bold">{t('analyzeTeaLeaf')}</h2>
                  <p className="text-[#475569] text-sm">{t('uploadInstructions')}</p>
                </div>

                {/* Image Preview Area */}
                <div className="bg-white rounded-[32px] border border-[rgba(192,201,187,0.1)] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] overflow-hidden">
                  <div
                    {...getRootProps()}
                    className={`aspect-[4/3] relative flex items-center justify-center cursor-pointer overflow-hidden ${
                      isDragActive ? 'bg-green-50' : 'bg-[#f5f5f4]'
                    }`}
                  >
                    <input {...getInputProps()} />

                    {image ? (
                      <>
                        <img src={image} alt="Leaf scan" className="w-full h-full object-cover" />

                        {analyzing && (
                          <>
                            {/* AI Scanning Overlay */}
                            <div className="absolute inset-0 bg-[rgba(0,69,13,0.05)]" />

                            {/* Top Bracket */}
                            <div className="absolute border-t-4 border-l-4 border-[#acf4a4] top-8 left-8 w-12 h-12 rounded-tl-3xl" />
                            <div className="absolute border-t-4 border-r-4 border-[#acf4a4] top-8 right-8 w-12 h-12 rounded-tr-3xl" />

                            {/* Bottom Bracket */}
                            <div className="absolute border-b-4 border-l-4 border-[#acf4a4] bottom-8 left-8 w-12 h-12 rounded-bl-3xl" />
                            <div className="absolute border-b-4 border-r-4 border-[#acf4a4] bottom-8 right-8 w-12 h-12 rounded-br-3xl" />

                            {/* Scanning Line */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#91d78a] to-transparent shadow-[0px_0px_15px_0px_#91d78a]" style={{top: `${progress}%`}} />

                            {/* AI Target Indicator */}
                            <div className="absolute w-16 h-16 border-2 border-dashed border-[rgba(255,185,87,0.5)] rounded-full flex items-center justify-center" style={{left: '40%', top: '30%'}}>
                              <div className="w-2 h-2 bg-[#533400] rounded-full" />
                            </div>

                            {/* Processing Label */}
                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 backdrop-blur-md bg-[rgba(26,28,26,0.8)] text-white px-6 py-2 rounded-full flex items-center gap-3">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-[#acf4a4] rounded-full" />
                                <div className="w-1.5 h-1.5 bg-[#acf4a4] rounded-full" />
                                <div className="w-1.5 h-1.5 bg-[#acf4a4] rounded-full" />
                              </div>
                              <span className="text-xs font-semibold tracking-widest uppercase">AI SCANNING IN PROGRESS</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[rgba(0,69,13,0.1)] flex items-center justify-center">
                          <span className="text-3xl">📷</span>
                        </div>
                        <p className="text-[#0f172a] font-medium">{t('upload')}</p>
                        <p className="text-[#64748b] text-xs">{t('fileTypeInfo')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicator */}
                {analyzing && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1c5f20] text-sm font-semibold">{t('detectingAnomalies')}</span>
                      <span className="text-[#0f172a] text-sm font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-[rgba(28,95,32,0.1)] rounded-full h-3 overflow-hidden">
                      <div className="bg-[#1c5f20] h-full rounded-full transition-all" style={{width: `${progress}%`}} />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {image && !analyzing && (
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <button onClick={handleRetake} className="bg-white border-2 border-[rgba(28,95,32,0.2)] text-[#0f172a] py-5 rounded-[24px] font-bold flex flex-col items-center gap-1 hover:bg-gray-50 transition-all">
                      <img alt="" className="block w-6 h-6" src={Retake} />
                      <span className="text-xs">{t('previous')}</span>
                    </button>
                    <button className="bg-white border-2 border-[rgba(28,95,32,0.2)] text-[#0f172a] py-5 rounded-[24px] font-bold flex flex-col items-center gap-1 hover:bg-gray-50 transition-all">
                      <img alt="" className="block w-6 h-6" src={Gallery} />
                      <span className="text-xs">{t('gallery')}</span>
                    </button>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={analyze}
                  disabled={!image || analyzing || loading}
                  className={`bg-[#1c5f20] text-white py-4 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-[0px_10px_15px_-3px_rgba(28,95,32,0.2),0px_4px_6px_-4px_rgba(28,95,32,0.2)] ${
                    !image || analyzing || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#165a1f]'
                  }`}
                >
                  <img alt="" className="block w-4 h-4" src={Analyze} />
                  <span>{t('confirm')}</span>
                </button>
              </div>

              {/* Right: Analysis Tips */}
              <div className="md:col-span-5 flex flex-col gap-6">
                {/* Tips Card */}
                <div className="bg-[#efeeeb] border border-[rgba(192,201,187,0.1)] rounded-[32px] p-8 flex flex-col gap-4">
                  <h3 className="text-[#00450d] text-lg font-bold">{t('analysisTips')}</h3>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-[rgba(27,94,32,0.1)] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <img alt="" className="block w-3 h-3" src={D_2} />
                      </div>
                      <p className="text-[#41493e] text-sm">{t('tipBright')}</p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-[rgba(27,94,32,0.1)] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <img alt="" className="block w-3 h-3" src={D_1} />
                      </div>
                      <p className="text-[#41493e] text-sm">{t('tipFlat')}</p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-[rgba(27,94,32,0.1)] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <img alt="" className="block w-3 h-3" src={D_3} />
                      </div>
                      <p className="text-[#41493e] text-sm">{t('tipBackground')}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Analysis Card */}
                <div className="bg-white border border-[rgba(192,201,187,0.05)] rounded-[32px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                      {lastAnalysis?.image_url ? (
                        <img src={lastAnalysis.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍃</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#41493e] text-xs font-semibold tracking-wide uppercase">{t('lastAnalysis')}</p>
                      {lastAnalysis ? (
                        <>
                          <h4 className="text-[#1a1c1a] font-bold mt-1 truncate">{lastAnalysis.disease}</h4>
                          <p className="text-[#1b6d24] text-xs font-medium">{Number(lastAnalysis.confidence).toFixed(1)}% {t('confidence')}</p>
                        </>
                      ) : (
                        <p className="text-[#41493e] text-sm mt-1">{t('noData')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e7e5e4] opacity-40 py-8 px-8 text-center">
            <p className="text-[#41493e] text-xs font-semibold tracking-[2px] uppercase">© 2026 SmartTeaCare Agronomy AI</p>
          </div>
        </div>
    </div>
  )
}

