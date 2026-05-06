import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../../api'
import { logger } from '../../utils/logger'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await authService.forgotPassword(email)

      if (error) {
        logger.error('ForgotPasswordPage', 'Submit failed', error)
        toast.error(error || 'Failed to send reset email')
        setLoading(false)
        return
      }

      logger.info('ForgotPasswordPage: Reset email sent', { email })
      setSubmitted(true)
      setLoading(false)
      toast.success('Reset link sent to your email!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      logger.error('ForgotPasswordPage', 'Submit error', err)
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#1e7e34] to-[#0f5d1f] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/forgot-password.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Smart Tea Care</h1>
          <p className="text-green-100">The Modern Agronomist Portal</p>
        </div>

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-white hover:text-green-100 transition"
        >
          <span>←</span>
          <span>Back to Login</span>
        </button>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#1e7e34] rounded-full flex items-center justify-center">
              <img
                src="/icons/forgot.png"
                alt="Forgot Password"
                className="w-10 h-10"
              />
            </div>
          </div>

          {!submitted ? (
            <>
              {/* Heading */}
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                Forgot Password?
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e7e34] hover:bg-[#1a6b2d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <img
                        src="/icons/send.png"
                        alt="Send"
                        className="w-4 h-4"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <p className="text-center text-gray-600 mt-6">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#1e7e34] hover:underline font-semibold"
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-20 h-20 text-[#1e7e34] mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h3>

                <p className="text-gray-600 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900 mb-6">{email}</p>

                <p className="text-gray-500 text-sm mb-8">
                  Click the link in the email to reset your password. You'll be redirected to the login page shortly.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#1e7e34] hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
