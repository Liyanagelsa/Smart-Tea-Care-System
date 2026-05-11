import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { supabase } from '../utils/supabase'
import { getT } from '../i18n/translations'
import { format } from 'date-fns'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TrendingUp, Users, BarChart3, Activity, RefreshCw, Trash2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function AdminPage() {
  const { isAdmin, language, user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDetections: 0,
    avgConfidence: 0,
    activeUsersMonth: 0,
    diseaseDetectedMonth: 0,
    accuracyRate: 0,
    topDisease: 'None'
  })
  const [diseaseStats, setDiseaseStats] = useState({})
  const [users, setUsers] = useState([])
  const [detections, setDetections] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Pagination
  const [usersPage, setUsersPage] = useState(0)
  const [detectionsPage, setDetectionsPage] = useState(0)
  const PAGE_SIZE = 10

  // Filters
  const [roleFilter, setRoleFilter] = useState('')
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('')

  const t = getT(language)

  if (authLoading) return null
  if (!isAdmin) return <Navigate to="/dashboard" />

  // Fetch all data
  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No authentication token found')
        return
      }

      // Get stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      // Get disease stats
      const diseaseRes = await fetch(`${API_URL}/admin/disease-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (diseaseRes.ok) {
        const data = await diseaseRes.json()
        setDiseaseStats(data.diseases || {})
      }

      // Get users
      const usersRes = await fetch(
        `${API_URL}/admin/users?limit=${PAGE_SIZE}&offset=${usersPage * PAGE_SIZE}${roleFilter ? `&role=${roleFilter}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }

      // Get detections
      let detectionsUrl = `${API_URL}/admin/detections?limit=${PAGE_SIZE}&offset=${detectionsPage * PAGE_SIZE}`
      if (diseaseFilter) detectionsUrl += `&disease=${diseaseFilter}`
      if (confidenceFilter === 'high') detectionsUrl += `&min_confidence=85`
      if (confidenceFilter === 'low') detectionsUrl += `&max_confidence=85`

      const detectionsRes = await fetch(detectionsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (detectionsRes.ok) {
        const data = await detectionsRes.json()
        setDetections(data.detections || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [usersPage, detectionsPage, roleFilter, diseaseFilter, confidenceFilter])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
    toast.success('Data refreshed!')
  }

  const handleDeleteDetection = async (detectionId) => {
    if (!window.confirm('Delete this detection?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/admin/detections/${detectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setDetections(d => d.filter(x => x.id !== detectionId))
        toast.success('Detection deleted')
        loadData()
      }
    } catch (error) {
      toast.error('Failed to delete detection')
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete user "${userEmail}"? This cannot be undone.`)) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setUsers(u => u.filter(x => x.id !== userId))
        toast.success('User deleted')
      } else {
        const err = await res.json()
        toast.error(err.detail || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  // Disease chart data
  const getDiseaseChartData = () => {
    const colors = ['#1c5f20', '#ea580c', '#059669', '#dc2626', '#7c3aed', '#f59e0b']
    return Object.entries(diseaseStats)
      .sort((a, b) => b[1].count - a[1].count)
      .map((entry, idx) => ({
        name: entry[0],
        count: entry[1].count,
        color: colors[idx % colors.length]
      }))
  }

  const diseaseChartData = getDiseaseChartData()
  const maxDiseaseCount = Math.max(...diseaseChartData.map(d => d.count), 1)

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/Main Content Area.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay to keep content readable */}
      <div className="min-h-screen bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0f172a] mb-2">Admin Dashboard</h1>
            <p className="text-[#475569]">Welcome, {user?.user_metadata?.full_name || 'Admin'}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c5f20] text-white rounded-lg hover:bg-[#1a6b2d] disabled:opacity-50 transition-all"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* KPI Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* First Row - 4 Cards */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-[#e2e8f0] rounded w-24 mb-3" />
                      <div className="h-8 bg-[#e2e8f0] rounded w-16 mb-3" />
                      <div className="h-3 bg-[#e2e8f0] rounded w-20" />
                    </div>
                    <div className="w-12 h-12 bg-[#e2e8f0] rounded-xl" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Total Users</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.totalUsers}</h3>
                      <p className="text-[#1c5f20] text-xs mt-2 flex items-center gap-1"><TrendingUp size={14} /> Registered</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Total Detections</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.totalDetections}</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">All time</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Avg Confidence</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.avgConfidence}%</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">Overall</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Activity size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Active Users</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.activeUsersMonth}</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Second Row - 3 Cards */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-[#e2e8f0] rounded w-24 mb-3" />
                      <div className="h-8 bg-[#e2e8f0] rounded w-16 mb-3" />
                      <div className="h-3 bg-[#e2e8f0] rounded w-20" />
                    </div>
                    <div className="w-12 h-12 bg-[#e2e8f0] rounded-xl" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Disease Detected</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.diseaseDetectedMonth}</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} className="text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Accuracy Rate</p>
                      <h3 className="text-3xl font-bold text-[#0f172a]">{stats.accuracyRate}%</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">Year to date</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp size={24} className="text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#64748b] text-sm font-medium mb-2">Most Common</p>
                      <h3 className="text-2xl font-bold text-[#0f172a]">{stats.topDisease}</h3>
                      <p className="text-[#1c5f20] text-xs mt-2">Disease</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Activity size={24} className="text-yellow-600" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Disease Distribution Chart */}
          {loading ? (
            <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-[#e2e8f0] rounded w-40 mb-5" />
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 mb-3">
                  <div className="w-32 h-3 bg-[#e2e8f0] rounded" />
                  <div className="flex-1 h-8 bg-[#e2e8f0] rounded-full" />
                  <div className="w-10 h-3 bg-[#e2e8f0] rounded" />
                </div>
              ))}
            </div>
          ) : diseaseChartData.length > 0 && (
            <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">Disease Distribution</h3>
              <div className="space-y-3">
                {diseaseChartData.map((disease) => (
                  <div key={disease.name} className="flex items-center gap-4">
                    <div className="w-32 font-medium text-sm text-[#0f172a]">{disease.name}</div>
                    <div className="flex-1 bg-[#e2e8f0] rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full flex items-center justify-end pr-3 text-white text-xs font-bold transition-all duration-500"
                        style={{
                          width: `${(disease.count / maxDiseaseCount) * 100}%`,
                          backgroundColor: disease.color
                        }}
                      >
                        {disease.count}
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm text-[#64748b]">
                      {((disease.count / Object.values(diseaseStats).reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#f1f5f9] p-1 rounded-xl w-fit">
          {['overview', 'users', 'detections'].map(tab_name => (
            <button key={tab_name}
              onClick={() => setTab(tab_name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === tab_name ? 'bg-[#1c5f20] text-white' : 'text-[#1c5f20] hover:text-[#0f172a]'
              }`}>
              {tab_name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="h-4 bg-[#e2e8f0] rounded w-32" />
            </div>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-[#e2e8f0] flex items-center gap-4">
                <div className="w-8 h-8 bg-[#e2e8f0] rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#e2e8f0] rounded w-1/3" />
                  <div className="h-3 bg-[#e2e8f0] rounded w-1/2" />
                </div>
                <div className="h-6 bg-[#e2e8f0] rounded-full w-16" />
                <div className="h-6 bg-[#e2e8f0] rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-[#e2e8f0]">
                    <h3 className="text-lg font-bold text-[#0f172a]">Recent Users</h3>
                  </div>
                  <div className="divide-y divide-[#e2e8f0]">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="px-6 py-3 flex items-center justify-between hover:bg-[#f8fafc]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {u.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0f172a]">{u.full_name}</p>
                            <p className="text-xs text-[#64748b]">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Detections */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-[#e2e8f0]">
                    <h3 className="text-lg font-bold text-[#0f172a]">Recent Detections</h3>
                  </div>
                  <div className="divide-y divide-[#e2e8f0] max-h-[300px] overflow-y-auto">
                    {detections.slice(0, 5).map(d => (
                      <div key={d.id} className="px-6 py-3 hover:bg-[#f8fafc]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#0f172a]">{d.disease}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#1c5f20]/10 text-[#1c5f20]">
                            {d.confidence}%
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b]">{format(new Date(d.created_at), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-4">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setUsersPage(0); }}
                    className="px-3 py-2 bg-[#f1f5f9] rounded-lg text-sm text-[#0f172a] border border-[#e2e8f0]"
                  >
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">User</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Email</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Role</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Joined</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                                {u.full_name?.charAt(0) || '?'}
                              </div>
                              <span className="text-[#0f172a] text-sm font-medium">{u.full_name || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#475569] text-sm">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>{u.role}</span>
                          </td>
                          <td className="px-6 py-4 text-[#1c5f20] text-sm">
                            {format(new Date(u.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all font-medium flex items-center gap-1"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                    disabled={usersPage === 0}
                    className="px-3 py-1 text-sm rounded-lg bg-[#1c5f20]/10 text-[#1c5f20] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-[#64748b]">Page {usersPage + 1}</span>
                  <button
                    onClick={() => setUsersPage(usersPage + 1)}
                    disabled={users.length < PAGE_SIZE}
                    className="px-3 py-1 text-sm rounded-lg bg-[#1c5f20]/10 text-[#1c5f20] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {tab === 'detections' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-4">
                  <select
                    value={diseaseFilter}
                    onChange={(e) => { setDiseaseFilter(e.target.value); setDetectionsPage(0); }}
                    className="px-3 py-2 bg-[#f1f5f9] rounded-lg text-sm text-[#0f172a] border border-[#e2e8f0]"
                  >
                    <option value="">All Diseases</option>
                    {Object.keys(diseaseStats).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={confidenceFilter}
                    onChange={(e) => { setConfidenceFilter(e.target.value); setDetectionsPage(0); }}
                    className="px-3 py-2 bg-[#f1f5f9] rounded-lg text-sm text-[#0f172a] border border-[#e2e8f0]"
                  >
                    <option value="">All Confidence</option>
                    <option value="high">High (≥85%)</option>
                    <option value="low">Low (&lt;85%)</option>
                  </select>
                </div>

                {/* Detections Table */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Disease</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Confidence</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Severity</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Date</th>
                        <th className="text-left text-[#1c5f20] text-xs px-6 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.map(d => (
                        <tr key={d.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                          <td className="px-6 py-4 text-[#0f172a] text-sm font-medium">{d.disease}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-[#1c5f20]/10 text-[#1c5f20]">
                              {d.confidence}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#475569]">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              d.severity_level === 'Severe' ? 'bg-red-100 text-red-700' :
                              d.severity_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              d.severity_level === 'Mild' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {d.severity_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#64748b]">
                            {format(new Date(d.created_at), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteDetection(d.id)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                            >
                              <Trash2 size={14} className="inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setDetectionsPage(Math.max(0, detectionsPage - 1))}
                    disabled={detectionsPage === 0}
                    className="px-3 py-1 text-sm rounded-lg bg-[#1c5f20]/10 text-[#1c5f20] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-[#64748b]">Page {detectionsPage + 1}</span>
                  <button
                    onClick={() => setDetectionsPage(detectionsPage + 1)}
                    disabled={detections.length < PAGE_SIZE}
                    className="px-3 py-1 text-sm rounded-lg bg-[#1c5f20]/10 text-[#1c5f20] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  )
}
