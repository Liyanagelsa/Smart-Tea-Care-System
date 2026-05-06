import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { supabase } from '../utils/supabase'
import { getT } from '../i18n/translations'
import { format } from 'date-fns'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { isAdmin, language } = useAuth()
  const [users, setUsers] = useState([])
  const [detections, setDetections] = useState([])
  const [stats, setStats] = useState({ users: 0, detections: 0, week: 0, topDisease: '-' })
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const t = getT(language)

  if (!isAdmin) return <Navigate to="/dashboard" />

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: profiles }, { data: history }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('detection_history').select('*').order('created_at', { ascending: false })
    ])

    if (profiles) setUsers(profiles)
    if (history) {
      setDetections(history)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const diseases = {}
      history.forEach(r => { diseases[r.disease] = (diseases[r.disease] || 0) + 1 })
      const topDisease = Object.entries(diseases).filter(([d]) => d !== 'Healthy').sort((a, b) => b[1] - a[1])[0]

      setStats({
        users: profiles?.length || 0,
        detections: history.length,
        week: history.filter(r => new Date(r.created_at) > weekAgo).length,
        topDisease: topDisease?.[0] || 'None'
      })
    }
    setLoading(false)
  }

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x))
      toast.success(`Role updated to ${newRole}`)
    }
  }

  const deleteDetection = async (id) => {
    const { error } = await supabase.from('detection_history').delete().eq('id', id)
    if (!error) {
      setDetections(d => d.filter(x => x.id !== id))
      toast.success('Deleted')
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-[#0f172a] mb-1">{t('adminDashboard')}</h1>
      <p className="text-[#1c5f20] text-sm mb-6">System overview and management</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <AdminStat label={t('totalUsers')} value={stats.users} icon="👥" color="blue" />
        <AdminStat label={t('totalDetections')} value={stats.detections} icon="🔬" color="green" />
        <AdminStat label={t('thisWeek')} value={stats.week} icon="📅" color="purple" />
        <AdminStat label={t('commonDisease')} value={stats.topDisease.split(' ')[0]} icon="🦠" color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[rgba(28,95,32,0.05)] p-1 rounded-xl w-fit">
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
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-[#1c5f20]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : (
        <>
          {tab === 'users' && (
            <div className="bg-white border border-[rgba(28,95,32,0.05)] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(28,95,32,0.05)]">
                    <th className="text-left text-[#1c5f20] text-xs px-5 py-3 font-semibold">User</th>
                    <th className="text-left text-[#1c5f20] text-xs px-5 py-3 font-semibold">Email</th>
                    <th className="text-left text-[#1c5f20] text-xs px-5 py-3 font-semibold">Role</th>
                    <th className="text-left text-[#1c5f20] text-xs px-5 py-3 font-semibold">Joined</th>
                    <th className="text-left text-[#1c5f20] text-xs px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-[rgba(28,95,32,0.05)] hover:bg-[#f6f8f6]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                            {u.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="text-[#0f172a] text-sm">{u.full_name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#475569] text-sm">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-[#ea580c]/10 text-[#ea580c]' : 'bg-[#1c5f20]/10 text-[#1c5f20]'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3 text-[#1c5f20] text-xs">
                        {format(new Date(u.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          className="text-xs px-3 py-1 rounded-lg bg-[#1c5f20]/10 text-[#1c5f20] hover:bg-[#1c5f20]/20 transition-all"
                        >
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'detections' && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {detections.map(d => (
                <div key={d.id} className="flex items-center gap-4 p-4 bg-white border border-[rgba(28,95,32,0.05)] rounded-xl hover:border-[rgba(28,95,32,0.1)] transition-all">
                  {d.image_url && <img src={d.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="text-[#0f172a] text-sm font-medium">{d.disease}</p>
                    <p className="text-[#1c5f20] text-xs">{format(new Date(d.created_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                  <span className="text-[#0f172a] text-sm font-medium">{d.confidence}%</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    d.severity_level === 'Severe' ? 'bg-red-500/20 text-red-600' :
                    d.severity_level === 'Moderate' ? 'bg-orange-500/20 text-orange-600' :
                    d.severity_level === 'Mild' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'
                  }`}>{d.severity_level}</span>
                  <button onClick={() => deleteDetection(d.id)}
                    className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-all">
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Disease breakdown */}
              <div className="bg-white border border-[rgba(28,95,32,0.05)] rounded-2xl p-5 shadow-sm">
                <h3 className="text-[#0f172a] font-semibold mb-4">Disease Breakdown</h3>
                {(() => {
                  const diseases = {}
                  detections.forEach(r => { diseases[r.disease] = (diseases[r.disease] || 0) + 1 })
                  return Object.entries(diseases).sort((a, b) => b[1] - a[1]).map(([disease, count]) => (
                    <div key={disease} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#0f172a]">{disease}</span>
                        <span className="text-[#1c5f20] font-medium">{count} ({Math.round(count / detections.length * 100)}%)</span>
                      </div>
                      <div className="h-2 bg-[rgba(28,95,32,0.1)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${disease === 'Healthy' ? 'bg-green-500' : 'bg-red-400'}`}
                          style={{ width: `${(count / detections.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Recent users */}
              <div className="bg-white border border-[rgba(28,95,32,0.05)] rounded-2xl p-5 shadow-sm">
                <h3 className="text-[#0f172a] font-semibold mb-4">Recent Users</h3>
                {users.slice(0, 8).map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-[rgba(28,95,32,0.05)] last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {u.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0f172a] text-sm">{u.full_name || 'Anonymous'}</p>
                      <p className="text-[#1c5f20] text-xs">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium ${u.role === 'admin' ? 'text-[#ea580c]' : 'text-[#1c5f20]'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdminStat({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  }
  return (
    <div className={`${colors[color]} border rounded-2xl p-4 bg-white`}>
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-[#0f172a] font-bold text-xl">{value}</p>
      <p className="text-[#475569] text-xs mt-0.5">{label}</p>
    </div>
  )
}

