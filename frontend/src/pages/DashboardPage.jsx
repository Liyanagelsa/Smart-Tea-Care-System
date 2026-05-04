import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getT } from '../i18n/translations'
import { logger } from '../utils/logger'
import { format, parseISO } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Image assets from Figma
const imgMainContentArea = '/images/Main Content Area.png'
const imgDashboardHero = '/images/Dashboard-Hero.png'
const imgLeafScanBlisterBlight = 'https://www.figma.com/api/mcp/asset/66b10aa5-9b92-4cd6-b73b-eff5e1a8abae'
const imgLeafScanHealthy = 'https://www.figma.com/api/mcp/asset/a92e8a8a-b926-4ded-b72b-3eaa0c87d185'
const imgLeafScanHealthy2 = 'https://www.figma.com/api/mcp/asset/ef9f855b-1bea-4562-a2ab-896cca824490'
const imgVector = 'https://www.figma.com/api/mcp/asset/a70cdce6-0bf0-4307-b44e-cbe68ff81187'
const imgVector1 = 'https://www.figma.com/api/mcp/asset/142f6546-5402-4a38-933b-af8b7c5ea9ee'
const imgContainer = 'https://www.figma.com/api/mcp/asset/50706d62-00d6-4e0f-b45d-8aa5476745b8'
const imgContainer1 = 'https://www.figma.com/api/mcp/asset/1c072ea6-d3ef-4c16-b442-7ad6f1203e16'
const imgContainer2 = 'https://www.figma.com/api/mcp/asset/f5ebb01d-2549-45a4-9d10-2225427fd735'
const imgContainer5 = 'https://www.figma.com/api/mcp/asset/91ca065e-fc11-42a2-b775-f562afa47d56'
const imgContainer7 = 'https://www.figma.com/api/mcp/asset/139e34ab-d306-46b0-a4ac-9b52b602a80b'
const imgContainer8 = 'https://www.figma.com/api/mcp/asset/dda69cf5-1849-4b5a-ae76-30dafd340514'
const imgContainer9 = 'https://www.figma.com/api/mcp/asset/336d1d37-f48a-4fbc-809e-f6bf66a2c678'
const imgContainer10 = 'https://www.figma.com/api/mcp/asset/9f5d44f8-332d-49d5-b6ef-df69a497719c'
const imgContainer11 = '../../public/icons/logout.png'
const imgStylizedSilhouette = 'https://www.figma.com/api/mcp/asset/0c6a05b4-e837-4244-9dce-a52469171a4e'
const imgDecorativeBotanical = 'https://www.figma.com/api/mcp/asset/9fd9c967-9fda-4ece-a384-b4057fb6775b'
const imgContainerDecor1 = 'https://www.figma.com/api/mcp/asset/fd9df192-948c-4dad-9a53-b500d742702d'
const imgContainerDecor2 = 'https://www.figma.com/api/mcp/asset/5afcbdbf-7acc-4c54-af82-804ae2b37c48'
const Home = '../../public/icons/Home.png'
const Detect = '../../public/icons/Detect.png'
const D_History = '../../public/icons/D_History.png'
const Profile = '../../public/icons/Profile_W.png'
const L_Leaf = '../../public/icons/L_Leaf.png'
const Round = '../../public/icons/Round.png'
const Leaf_D = '../../public/icons/Leaf_D.png'
const Detect_G = '../../public/icons/Detect_G.png'
const History_B = '../../public/icons/History_B.png'

const animationStyle = `
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.4;
      box-shadow: 0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1), 0 0 20px rgba(145, 215, 138, 0.3);
    }
    50% {
      opacity: 0.8;
      box-shadow: 0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1), 0 0 40px rgba(145, 215, 138, 0.6);
    }
  }
  .animate-pulse-glow {
    animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`

export default function DashboardPage() {
  const { user, language } = useAuth()
  const t = getT(language)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentScans()
  }, [user])

  const fetchRecentScans = async () => {
    if (!user) return
    setLoading(true)
    try {
      logger.info('DashboardPage: Fetching recent scans...')
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/detections`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Get last 3 scans
        const last3 = (data || []).slice(0, 3)
        logger.info('DashboardPage: Fetched recent scans', { count: last3.length })
        setRecentScans(last3)
      } else {
        logger.error('DashboardPage', 'Fetch failed', { status: response.status })
      }
    } catch (error) {
      logger.error('DashboardPage', 'fetchRecentScans error', { message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    if (!severity) return { bg: 'bg-gray-200', text: 'text-gray-700', label: 'UNKNOWN' }
    const lower = severity.toLowerCase()
    if (lower === 'severe' || lower === 'critical') return { bg: 'bg-[#ffdad6]', text: 'text-[#93000a]', label: 'WARNING' }
    if (lower === 'moderate' || lower === 'warning') return { bg: 'bg-[#ffddb5]', text: 'text-[#643f00]', label: 'MODERATE' }
    if (lower === 'healthy' || lower === 'none' || lower === 'optimal') return { bg: 'bg-[#a0f399]', text: 'text-[#217128]', label: 'OPTIMAL' }
    return { bg: 'bg-gray-200', text: 'text-gray-700', label: 'UNKNOWN' }
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('greeting_morning')
    if (hour < 18) return t('greeting_afternoon')
    return t('greeting_evening')
  }

  const userName = user?.user_metadata?.full_name || 'User'

  return (
    <div className="flex-1 min-h-screen flex flex-col relative">
        <style>{animationStyle}</style>
        {/* Background Image */}
        <img
          src={imgMainContentArea}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Page Content */}
        <div className="overflow-y-auto flex-1 relative z-5 flex flex-col">
          <div className="flex flex-col gap-10 px-20 py-8">
            {/* Greeting Section */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[#1a1c1a] text-3xl font-extrabold tracking-[-0.75px]">{getTimeBasedGreeting()}, {userName}.</h2>
              <p className="text-[#41493e] text-base font-medium">{t('dashboardDescription')}</p>
            </div>

            {/* Hero Section - Nurturing Heritage */}
            <div
              className="rounded-[32px] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] relative h-[398px] w-full"
              style={{
                backgroundImage: `url('${imgDashboardHero}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(28,95,32,0.8)] to-[rgba(13,58,18,0.65)] rounded-[32px]" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute opacity-10 blur-3xl rounded-full w-96 h-96 bg-[#91d78a] -right-32 -bottom-32" />
              </div>

              <div className="relative z-10 w-full h-full px-12 py-12 flex items-center justify-between gap-12">
                {/* Left Side Content */}
                <div className="flex flex-col justify-center gap-6 flex-1 max-w-md">
                  {/* Sustainability Badge */}
                  <div className="backdrop-blur-[2px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-full px-3 py-1.5 w-fit flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#91d78a]" />
                    <span className="text-[10px] font-bold text-[rgba(255,255,255,0.8)] tracking-[1px] uppercase whitespace-nowrap">
                      SUSTAINABILITY FIRST
                    </span>
                  </div>

                  {/* Main Heading */}
                  <div className="flex flex-col gap-0">
                    <h1 className="text-[48px] font-extrabold text-white leading-[48px] tracking-[-1.5px]">
                      Nurturing Sri
                    </h1>
                    <h1 className="text-[48px] font-extrabold text-white leading-[48px] tracking-[-1.5px]">
                      Lanka's
                    </h1>
                    <h1 className="text-[48px] font-extrabold text-[#acf4a4] leading-[48px] tracking-[-1.5px]">
                      Green Heritage
                    </h1>
                  </div>

                  {/* Description */}
                  <p className="text-[16px] font-medium text-[rgba(255,255,255,0.8)] leading-[24px]">
                    Protecting the legacy of world-class tea through precision agronomy.
                  </p>
                </div>

                {/* Right Side Visuals */}
                <div className="flex items-center justify-center relative h-full flex-1">
                  {/* Silhouette Container */}
                  <div className="flex items-center justify-center relative h-[384px] w-[288px]">
                    {/* Stylized Silhouette with Gradient Mask */}
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{
                          backgroundImage: `linear-gradient(135deg, rgba(145, 215, 138, 0.4) 0%, rgba(27, 109, 36, 0.2) 100%)`,
                          maskImage: `url('${imgStylizedSilhouette}')`,
                          WebkitMaskImage: `url('${imgStylizedSilhouette}')`,
                          maskSize: '100% 100%',
                          maskPosition: '0% 0%',
                          maskRepeat: 'no-repeat'
                        }}
                      />
                    </div>

                    {/* Decorative Botanical Element 1 */}
                    <div className="absolute top-[42.28px] left-[44.04px] w-[50.525px] h-[50.49px] flex items-center justify-center transform rotate-12">
                      <div className="w-[42.607px] h-[42.562px] relative">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src={imgDecorativeBotanical}
                        />
                      </div>
                    </div>

                    {/* Decorative Botanical Element 2 */}
                    <div className="absolute bottom-[73.13px] right-[31.13px] w-[40.305px] h-[40.305px] flex items-center justify-center transform -rotate-45">
                      <div className="w-[27px] h-[30px] relative">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src={imgContainerDecor1}
                        />
                      </div>
                    </div>

                    {/* Tea Season Card */}
                    <div className="absolute bottom-1/4 left-0 backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-[16px] px-[21px] py-[13px] flex gap-3 items-center shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
                      <div className="w-[10.5px] h-[11.667px] flex-shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src={imgContainerDecor2}
                        />
                      </div>
                      <div className="flex flex-col gap-0">
                        <p className="text-[10px] font-bold text-[rgba(255,255,255,0.6)] tracking-[-0.5px] uppercase whitespace-nowrap">
                          TEA SEASON
                        </p>
                        <p className="text-[14px] font-bold text-white whitespace-nowrap">
                          Prime Harvest
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="flex flex-col gap-6">
              <div className="flex gap-3 items-center">
                <h3 className="text-[#1a1c1a] text-xl font-bold tracking-[-0.5px]">{t('quickaction')}</h3>
                <div className="flex-1 h-px bg-[rgba(192,201,187,0.3)]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Detect Disease Card */}
                <Link
                  to="/detect"
                  className="bg-white rounded-[12px] border border-[rgba(192,201,187,0.1)] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex gap-5 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="bg-[rgba(0,69,13,0.1)] rounded-[12px] flex items-center justify-center w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img alt="" className="block w-6 h-6" src={Detect_G} />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="text-[#1a1c1a] text-lg font-semibold">{t('detectTitle')}</h4>
                    <p className="text-[#41493e] text-sm">{t('detectDescription')}</p>
                  </div>
                </Link>

                {/* View History Card */}
                <Link
                  to="/history"
                  className="bg-white rounded-[12px] border border-[rgba(192,201,187,0.1)] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 flex gap-5 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="bg-[rgba(83,52,0,0.1)] rounded-[12px] flex items-center justify-center w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img alt="" className="block w-6 h-6" src={History_B} />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="text-[#1a1c1a] text-lg font-semibold">{t('historyTitle')}</h4>
                    <p className="text-[#41493e] text-sm">{t('historyDescription')}</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Scans Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-end justify-between">
                <h3 className="text-[#1a1c1a] text-xl font-bold tracking-[-0.5px]">{t('historyTitle')}</h3>
                <Link to="/history" className="text-[#00450d] text-sm font-semibold hover:underline">{t('next')}</Link>
              </div>

              <div className="bg-white rounded-[12px] border border-[rgba(192,201,187,0.1)] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <svg className="animate-spin w-6 h-6 text-[#1c5f20] mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : recentScans.length === 0 ? (
                  <div className="p-8 text-center text-[#41493e]">
                    <p>{t('noData')}</p>
                  </div>
                ) : (
                  recentScans.map((scan, idx) => {
                    const severityInfo = getSeverityColor(scan.severity_level)
                    return (
                      <div
                        key={scan.id}
                        className={`flex gap-4 items-center p-5 hover:bg-[rgba(0,69,13,0.02)] transition-all ${
                          idx > 0 ? 'border-t border-[#f5f5f4]' : ''
                        }`}
                      >
                        {/* Leaf Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#efeeeb]">
                          {scan.image_url ? (
                            <img
                              src={scan.image_url}
                              alt={scan.disease}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍃</div>
                          )}
                        </div>

                        {/* Disease Info */}
                        <div className="flex-1">
                          <h5 className="text-[#1a1c1a] text-base font-semibold">{scan.disease}</h5>
                          <p className="text-[#41493e] text-xs">{format(parseISO(scan.created_at), 'MMM dd, yyyy • hh:mm a')}</p>
                        </div>

                        {/* Status Container */}
                        <div className="relative w-32 h-9 flex flex-col items-end">
                          <div
                            className={`absolute px-3 py-0.5 rounded-full right-0 top-0 ${severityInfo.bg}`}
                          >
                            <p className={`text-xs font-semibold whitespace-nowrap ${severityInfo.text}`}>
                              {severityInfo.label}
                            </p>
                          </div>
                          <p className="text-[#41493e] text-xs font-medium absolute bottom-0 right-0">{(scan.confidence || 0).toFixed(1)}%</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e7e5e4] opacity-40 py-8 px-8 text-center">
            <p className="text-[#41493e] text-xs font-semibold tracking-[2px] uppercase">
              © 2026 SmartTeaCare Agronomy AI
            </p>
          </div>
        </div>
    </div>
  )
}
