import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getT } from '../i18n/translations'
import toast from 'react-hot-toast'
import { logger } from '../utils/logger'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Figma Image Assets
const imgMainContentArea = '/images/Main Content Area.png'


export default function HistoryPage() {
  const { user, language } = useAuth()
  const navigate = useNavigate()
  const t = getT(language)
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchDetections()
  }, [])

  const fetchDetections = async () => {
    logger.info('HistoryPage: Fetching detection history')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        logger.warn('HistoryPage: No token found')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/detections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('HistoryPage', 'Failed to fetch detections', { status: response.status, error: errorText })
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()
      logger.info('HistoryPage: Detections loaded', { count: data.length })
      setDetections(data)
    } catch (error) {
      logger.error('HistoryPage', 'Error fetching detections', { message: error.message })
      toast.error('Failed to load detection history')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severityLevel, confidence) => {
    const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-semibold uppercase'

    if (severityLevel === 'Severe') {
      return {
        bg: 'bg-[#ffdad6]',
        text: 'text-[#93000a]',
        label: 'CRITICAL'
      }
    } else if (severityLevel === 'Moderate') {
      return {
        bg: 'bg-[#ffddb5]',
        text: 'text-[#643f00]',
        label: 'WARNING'
      }
    } else if (severityLevel === 'None') {
      return {
        bg: 'bg-[#a0f399]',
        text: 'text-[#217128]',
        label: 'OPTIMAL'
      }
    }
    // Mild or default
    return {
      bg: 'bg-[#e1f5ff]',
      text: 'text-[#01579b]',
      label: 'MILD'
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'TODAY'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'YESTERDAY'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase()
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const groupDetectionsByDate = (detections) => {
    const groups = {}
    detections.forEach(detection => {
      const dateKey = formatDate(detection.created_at)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(detection)
    })
    return groups
  }

  const groupedDetections = groupDetectionsByDate(detections)
  const dateKeys = Object.keys(groupedDetections).sort((a, b) => {
    if (a === 'TODAY') return -1
    if (b === 'TODAY') return 1
    if (a === 'YESTERDAY') return -1
    if (b === 'YESTERDAY') return 1
    return new Date(b) - new Date(a)
  })

  return (
    <div className="w-full min-h-screen flex flex-col relative">
        {/* Background Image */}
        <img
          src={imgMainContentArea}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Page Content */}
        <div className="overflow-y-auto flex-1 relative z-5 flex flex-col">
          <div className="flex flex-col gap-10 px-20 py-8">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold text-[#1a1c1a] tracking-[-0.75px]">{t('historyTitle')}</h1>
              <div className="max-w-2xl text-[#41493e] text-base leading-6">
                <p>{t('historyDescription')}</p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-[#41493e] text-lg">{t('loading')}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && detections.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-[#41493e] text-lg">{t('noData')}</p>
                  <p className="text-[#78716c] text-sm mt-2">{t('detectDescription')}</p>
                </div>
              </div>
            )}

            {/* History Groups */}
            {!loading && detections.length > 0 && (
              <div className="flex flex-col gap-10">
                {dateKeys.map((dateKey) => (
                  <div key={dateKey} className="flex flex-col gap-6">
                    {/* Date Header with divider */}
                    <div className="flex gap-4 items-center pt-2">
                      <h3 className="text-[#41493e] text-sm font-semibold tracking-widest uppercase whitespace-nowrap">
                        {dateKey}
                      </h3>
                      <div className="flex-1 h-px bg-[rgba(192,201,187,0.3)]" />
                    </div>

                    {/* Detection Cards */}
                    <div className="flex flex-col gap-4">
                      {groupedDetections[dateKey].map((detection) => {
                        const badge = getSeverityBadge(detection.severity_level, detection.confidence)
                        const isExpanded = expandedId === detection.id

                        return (
                          <div
                            key={detection.id}
                            className="bg-white rounded-3xl shadow-[0px_4px_20px_0px_rgba(26,28,26,0.06)] px-4 py-4 hover:shadow-[0px_6px_24px_0px_rgba(26,28,26,0.1)] transition-all"
                          >
                            <div className="flex items-center justify-between gap-6 h-20">
                              {/* Left: Image + Details */}
                              <div className="flex gap-6 items-center min-w-0 flex-1">
                                {/* Image - 80x80 */}
                                <div className="flex-shrink-0 rounded-xl overflow-hidden bg-[#efeeeb] w-20 h-20">
                                  {detection.image_url ? (
                                    <img
                                      src={detection.image_url}
                                      alt={detection.disease}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#78716c] text-xs">
                                      No image
                                    </div>
                                  )}
                                </div>

                                {/* Disease Info */}
                                <div className="flex flex-col gap-1 min-w-0">
                                  <h4 className="text-[#1a1c1a] text-lg font-bold leading-7 truncate">
                                    {detection.disease}
                                  </h4>
                                  <div className="flex gap-3 items-center flex-wrap">
                                    <div className="flex gap-1 items-center whitespace-nowrap">
                                      <svg className="w-3 h-3 text-[#41493e]" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="1" />
                                        <path d="M12 5v7m0 0v7" strokeWidth="2" stroke="currentColor" fill="none" />
                                      </svg>
                                      <span className="text-[#41493e] text-xs leading-4">{formatTime(detection.created_at)}</span>
                                    </div>
                                    <div className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
                                      {badge.label}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Confidence + Button */}
                              <div className="flex gap-12 items-center flex-shrink-0">
                                <div className="flex flex-col gap-1 items-end">
                                  <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[1px]">
                                    {t('confirm')}
                                  </p>
                                  <p className="text-[#00450d] text-3xl font-extrabold leading-8">
                                    {detection.confidence}%
                                  </p>
                                </div>
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : detection.id)}
                                  className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-[#f4f3f1] transition-all flex-shrink-0 hover:bg-[#f4f3f1]"
                                  title={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg className={`w-2 h-3 text-[#1a1c1a] transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-[#e7e5e4] space-y-4">
                                {detection.notes && (
                                  <div>
                                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[1px] mb-2">
                                      Notes
                                    </p>
                                    <p className="text-[#1a1c1a] text-sm leading-5">{detection.notes}</p>
                                  </div>
                                )}

                                {detection.location && (
                                  <div>
                                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[1px] mb-2">
                                      Location
                                    </p>
                                    <p className="text-[#1a1c1a] text-sm leading-5">{detection.location}</p>
                                  </div>
                                )}

                                {detection.treatment && (
                                  <div>
                                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[1px] mb-2">
                                      Treatment
                                    </p>
                                    <div className="bg-[#f4f3f1] rounded-[8px] p-4 space-y-3">
                                      {detection.treatment.immediate && (
                                        <div>
                                          <p className="text-[#1a1c1a] font-semibold text-sm mb-1">Immediate Actions:</p>
                                          <ul className="text-[#41493e] text-sm space-y-1">
                                            {detection.treatment.immediate.map((action, idx) => (
                                              <li key={idx} className="flex gap-2">
                                                <span>•</span>
                                                <span>{action}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {detection.treatment.preventive && (
                                        <div>
                                          <p className="text-[#1a1c1a] font-semibold text-sm mb-1">Preventive Measures:</p>
                                          <ul className="text-[#41493e] text-sm space-y-1">
                                            {detection.treatment.preventive.map((action, idx) => (
                                              <li key={idx} className="flex gap-2">
                                                <span>•</span>
                                                <span>{action}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {detection.all_probabilities && (
                                  <div>
                                    <p className="text-[#41493e] text-xs font-semibold uppercase tracking-[1px] mb-2">
                                      All Probabilities
                                    </p>
                                    <div className="bg-[#f4f3f1] rounded-[8px] p-4 space-y-2">
                                      {Object.entries(detection.all_probabilities).map(([disease, prob]) => (
                                        <div key={disease} className="flex justify-between items-center">
                                          <span className="text-[#41493e] text-sm">{disease}</span>
                                          <span className="text-[#1a1c1a] font-semibold text-sm">{prob}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#e7e5e4] opacity-40 py-8 px-8 text-center">
            <p className="text-[#41493e] text-xs font-semibold tracking-[2px] uppercase">© 2026 SMARTTEACARE AGRONOMY AI</p>
          </div>
        </div>
    </div>
  )
}
