import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getT } from '../i18n/translations'

const L_Leaf = '../../public/icons/L_Leaf.png'
const Home = '../../public/icons/Home.png'
const Detect = '../../public/icons/Detect.png'
const D_History = '../../public/icons/D_History.png'
const Profile = '../../public/icons/Profile_W.png'
const Logout = '../../public/icons/logout.png'

export default function Sidebar() {
  const { signOut, language } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const t = getT(language)

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('dashboard') },
    { to: '/detect', icon: Detect, label: t('detect') },
    { to: '/history', icon: D_History, label: t('history') },
    { to: '/profile', icon: Profile, label: t('profile') },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="fixed left-0 top-0 bg-[#faf9f6] flex flex-col h-screen w-64 px-4 py-8 z-20">
      {/* Logo */}
      <div className="pb-10 mb-10 border-b border-[#e7e5e4]">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex items-center justify-center rounded-[16px] bg-[rgba(28,95,32,0.1)] w-10 h-10 flex-shrink-0">
            <img alt="" className="block w-4 h-4" src={L_Leaf} />
          </div>
          <h1 className="text-[#00450d] text-xl font-bold tracking-[-0.5px] leading-7">SmartTeaCare</h1>
        </div>
        <p className="text-[#78716c] text-xs font-medium tracking-[0.5px] uppercase">Modern Agronomy AI</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex gap-3 items-center pl-5 py-3 rounded-lg transition-all ${
                isActive
                  ? 'border-l-4 border-[#00450d]'
                  : 'text-[#78716c] hover:bg-white/50'
              }`}
            >
              <img alt="" className="block w-4 h-4" src={item.icon} />
              <span className={`text-sm leading-5 ${isActive ? 'text-[#00450d] font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className="text-[#78716c] hover:bg-white/50 flex gap-3 items-center pl-5 py-3 rounded-lg transition-all w-full text-left"
        >
          <img alt="" className="block w-4 h-4" src={Logout} />
          <span className="text-sm font-normal leading-5">{t('logout')}</span>
        </button>
      </div>
    </div>
  )
}
