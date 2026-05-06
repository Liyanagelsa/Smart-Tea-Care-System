import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { logger } from '../../utils/logger'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is in a valid reset session
    const validateSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setValidating(false)
        } else {
          setError('Invalid or expired reset link. Please request a new one.')
          setValidating(false)
        }
      } catch (err) {
        logger.error('ResetPasswordPage', 'Session validation', err)
        setError('Failed to validate reset session.')
        setValidating(false)
      }
    }

    validateSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) {
      toast.error('Please enter a new password')
      return
    }

    if (!confirmPassword) {
      toast.error('Please confirm your password')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        logger.error('ResetPasswordPage', 'Password update failed', updateError)
        toast.error(updateError.message || 'Failed to reset password')
        setLoading(false)
        return
      }

      logger.info('ResetPasswordPage: Password reset successful')
      toast.success('Password reset successfully! Redirecting to login...')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      logger.error('ResetPasswordPage', 'Reset error', err)
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#1e7e34] to-[#0f5d1f] text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url(/images/Tea\ Plantation.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-white hover:text-green-100 transition"
          >
            <span>←</span>
            <span>Back to Login</span>
          </button>
        </div>

        {/* Right Side - Error Message */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Reset Link Invalid</h2>
            <p className="text-gray-600 mb-8">{error}</p>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[#1e7e34] hover:underline font-semibold"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#1e7e34] to-[#0f5d1f] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/Tea\ Plantation.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
                src="/icons/head.png"
                alt="User Account"
                className="w-10 h-10"
              />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Reset Password
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-8">
            Enter your new password below to reset your account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                NEW PASSWORD
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                CONFIRM PASSWORD
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
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
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <span>➜</span>
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
        </div>
      </div>
    </div>
  )
}
