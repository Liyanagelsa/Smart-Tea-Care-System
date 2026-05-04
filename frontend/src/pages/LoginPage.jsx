import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getT, getLanguageName } from '../i18n/translations'
import { logger } from '../utils/logger'
import toast from 'react-hot-toast'
import { Eye, EyeOff, HelpCircle, ArrowRight } from 'lucide-react'

// Image assets from Figma
const teaBackgroundLogin = '../public/images/Sri Lankan Tea Plantation.png'
const teaBackgroundRegister = '../public/images/Tea Plantation.png'
const iconEmail = '../public/icons/mail.png'
const iconPassword = '../public/icons/lock.png'
const iconEye = '../public/icons/eye.png'
const iconUser = '../public/icons/h_profile.png'
const iconPlantation = '../public/icons/plantation.png'
const iconLocation = '../public/icons/location.png'
const logoIcon = '../public/icons/leaf.png'
const logoIconLogin = '../public/icons/L_leaf.png'
const googleIcon = 'https://www.figma.com/api/mcp/asset/e84febf3-5661-4ab3-bb6c-434b81b6854a'
const helpIcon = 'https://www.figma.com/api/mcp/asset/59ab0199-d6b6-4452-ba23-39ae3c707ab1'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [plantationName, setPlantationName] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [selectedLang, setSelectedLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const submitInProgress = useRef(false)

  const { signIn, signUp, updateLanguage } = useAuth()
  const t = getT(selectedLang)
  const navigate = useNavigate()

  const handleLanguageChange = (lang) => {
    logger.info('LoginPage: Changing language', { lang })
    setSelectedLang(lang)
    updateLanguage(lang)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (submitInProgress.current || loading) {
      toast.error('Request already in progress. Please wait.')
      return
    }

    submitInProgress.current = true
    setLoading(true)

    try {
      logger.info('LoginPage: Signing in user', { email })
      const { error } = await signIn(email, password)
      if (error) {
        logger.error('LoginPage', 'Sign in failed', { error })
        toast.error('Invalid email or password')
        submitInProgress.current = false
        setLoading(false)
        return
      }
      toast.success('Welcome! 🍃')
      navigate('/dashboard')
    } catch (err) {
      logger.error('LoginPage', 'Login error', { message: err.message })
      toast.error('An error occurred. Please try again.')
      submitInProgress.current = false
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!agreeTerms) {
      toast.error('Please agree to Terms of Service and Privacy Policy')
      return
    }

    if (submitInProgress.current || loading) {
      toast.error('Request already in progress. Please wait.')
      return
    }

    submitInProgress.current = true
    setLoading(true)

    try {
      logger.info('LoginPage: Registering user', { email, fullName, plantationName, location })
      const { error } = await signUp(email, password, fullName, plantationName, location)
      if (error) {
        toast.error(error.message || 'Registration failed. Please try again.')
        submitInProgress.current = false
        setLoading(false)
        return
      }
      toast.success('Account created! Please check your email to verify, then login.')
      setFullName('')
      setEmail('')
      setPassword('')
      setPlantationName('')
      setLocation('')
      setAgreeTerms(false)
      setMode('login')
      submitInProgress.current = false
    } catch (err) {
      logger.error('LoginPage', 'Register error', { message: err.message })
      toast.error('An error occurred. Please try again.')
      submitInProgress.current = false
      setLoading(false)
    }
  }

  // REGISTER MODE
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex relative overflow-hidden">
        {/* Left Side - Tea Plantation Background */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-[#00450d]">
          <div className="absolute inset-0">
            <img
              src={teaBackgroundRegister}
              alt="Tea plantation"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-[rgba(27,94,32,0.2)] mix-blend-multiply" />

          {/* Brand Overlay Content */}
          <div className="absolute inset-0 flex items-end pb-20">
            <div className="max-w-lg ml-16 space-y-6 text-white">
              <div className="flex items-center gap-2">
                <img src={logoIcon} alt="SmartTeaCare" className="w-6 h-6" />
                <h1 className="text-2xl font-bold">SmartTeaCare</h1>
              </div>
              <h2 className="text-5xl font-extrabold leading-tight">
                Cultivating the<br />
                <span className="text-[#acf4a4]">future of precision</span>
                <br />
                <span className="text-[#acf4a4]">tea</span> farming.
              </h2>
              <p className="text-lg text-[rgba(255,255,255,0.8)]">
                Detect tea plant diseases early and receive smart treatment recommendations to protect crop health and improve yield.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col relative overflow-y-auto">
          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-12">
            <div className="w-full max-w-md">
              {/* Heading */}
              <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-[#1a1c1a] tracking-tight mb-2">
                  {t('register')}
                </h1>
                <p className="text-[#41493e] text-base">
                  {t('dashboardDescription')}
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-[#41493e] text-sm font-semibold uppercase tracking-wide">
                    {t('add')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Elena"
                      className="w-full pl-12 pr-4 py-[18px] bg-[#e9e8e5] border border-transparent rounded-[12px] text-[#0f172a] placeholder-[#717a6d] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                      required
                    />
                    <img
                      src={iconUser}
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[#41493e] text-sm font-semibold uppercase tracking-wide">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-12 pr-4 py-[18px] bg-[#e9e8e5] border border-transparent rounded-[12px] text-[#0f172a] placeholder-[#717a6d] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                      required
                    />
                    <img
                      src={iconEmail}
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    />
                  </div>
                </div>

                {/* Plantation Name & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[#41493e] text-sm font-semibold uppercase tracking-wide">
                      Plantation Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={plantationName}
                        onChange={(e) => setPlantationName(e.target.value)}
                        placeholder="Mountain Mist Estate"
                        className="w-full pl-12 pr-4 py-[18px] bg-[#e9e8e5] border border-transparent rounded-[12px] text-[#0f172a] placeholder-[#717a6d] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                      />
                      <img
                        src={iconPlantation}
                        alt=""
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[#41493e] text-sm font-semibold uppercase tracking-wide">
                      Location/District
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Nuwara Eliya"
                        className="w-full pl-12 pr-4 py-[18px] bg-[#e9e8e5] border border-transparent rounded-[12px] text-[#0f172a] placeholder-[#717a6d] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                      />
                      <img
                        src={iconLocation}
                        alt=""
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-[#41493e] text-sm font-semibold uppercase tracking-wide">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-[18px] bg-[#e9e8e5] border border-transparent rounded-[12px] text-[#0f172a] placeholder-[#717a6d] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                      required
                      minLength={6}
                    />
                    <img
                      src={iconPassword}
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717a6d] hover:text-[#00450d]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex gap-3 py-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 border border-[#c0c9bb] rounded accent-[#00450d] cursor-pointer flex-shrink-0 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[#41493e] text-sm leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <span className="font-semibold text-[#00450d]">Terms of Service</span> and{' '}
                    <span className="font-semibold text-[#00450d]">Privacy Policy</span>.
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00450d] hover:bg-[#003007] disabled:bg-[#00450d]/50 text-white font-bold text-lg py-4 rounded-[12px] transition-all shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('creatingAccount')}
                    </>
                  ) : (
                    <>
                      {t('register')}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>


              {/* Login Link */}
              <div className="text-center mt-8">
                <p className="text-[#41493e] text-sm">
                  {t('alreadyHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-[#00450d] hover:underline"
                  >
                    {t('login')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // LOGIN MODE
  return (
    <div className="min-h-screen bg-[#faf9f6] flex relative overflow-hidden">
      {/* Left Side - Tea Plantation Background */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-[#00450d]">
        <div className="absolute inset-0">
          <img
            src={teaBackgroundLogin}
            alt="Tea plantation"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(126.09803944983281deg, rgba(0, 69, 13, 0.4) 0%, rgba(0, 69, 13, 0.8) 100%)',
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md ml-16 text-white space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
                Cultivating the Future of{' '}
                <span className="text-[#acf4a4]">Precision Tea</span> Agronomy.
              </h2>
            </div>
            <p className="text-lg text-[rgba(255,255,255,0.8)] leading-relaxed">
              AI-powered tea disease detection with actionable treatment suggestions for better crop care.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Navigation / Logo Area */}
        <div className="h-20 flex items-center px-8 lg:px-12 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[16px] bg-[rgba(28,95,32,0.1)] flex items-center justify-center">
              <img src={logoIconLogin} alt="Logo" className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#1c5f20] tracking-[-0.5px]">SmartTeaCare</h1>
          </div>
        </div>

        {/* Language Selector */}
        <div className="absolute top-20 left-8 lg:left-auto lg:right-20 z-20">
          <div className="flex gap-1 bg-[rgba(233,232,229,0.5)] backdrop-blur-sm border border-[rgba(192,201,187,0.1)] rounded-full p-1">
            {['en', 'si', 'ta'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedLang === lang
                    ? 'bg-[#00450d] text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                    : 'text-[#41493e] hover:bg-white/50'
                }`}
              >
                {getLanguageName(lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 pb-20">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-12 space-y-2">
              <h2 className="text-3xl font-extrabold text-[#1a1c1a] tracking-tight">
                {t('welcome')}
              </h2>
              <p className="text-[#41493e] text-base">
                {t('dashboardDescription')}
              </p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white border border-[rgba(192,201,187,0.1)] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] p-6 space-y-4 mb-6">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[#334155] text-sm font-medium block">{t('email')}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <img src={iconEmail} alt="" className="w-[22px] h-[21px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#f6f8f6] border border-transparent rounded-[16px] text-[#0f172a] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-[#334155] text-sm font-medium block">{t('password')}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <img src={iconPassword} alt="" className="w-[13px] h-[21px]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-[#f6f8f6] border border-transparent rounded-[16px] text-[#0f172a] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#1c5f20]"
                  >
                    <img src={iconEye} alt="" className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-[#cbd5e1] rounded-lg accent-[#00450d]"
                  />
                  <span className="text-[#475569] text-xs">{t('rememberMe')}</span>
                </label>
                <a href="#" className="text-[#1c5f20] text-xs font-semibold hover:underline">
                  {t('forgotPassword')}
                </a>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#1c5f20] hover:bg-[#165a1f] disabled:bg-[#1c5f20]/50 text-white font-bold text-base py-3 rounded-[16px] transition-all shadow-[0px_10px_15px_-3px_rgba(28,95,32,0.2),0px_4px_6px_-4px_rgba(28,95,32,0.2)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    {t('login')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-[#64748b] text-sm">
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-[#1c5f20] hover:underline"
              >
                {t('register')}
              </button>
            </p>
          </div>
        </div>

        {/* Floating Support Bubble */}
        <div className="absolute bottom-8 right-8">
          <button className="w-12 h-12 rounded-full bg-white border border-[rgba(192,201,187,0.1)] flex items-center justify-center hover:shadow-lg transition-all" title="Need assistance?">
            <img src={helpIcon} alt="" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
