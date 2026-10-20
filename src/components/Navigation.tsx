import React from 'react'
import {
  LayoutDashboard,
  ScanLine,
  Activity,
  Package,
  Warehouse,
  TrendingUp,
  LineChart,
  BadgeDollarSign,
  Bot,
  CloudSun,
  Bell,
  FileSpreadsheet,
  Settings,
  Menu,
  X,
  Languages,
  LogOut,
  Leaf,
  ShieldCheck,
  Search,
  Sparkles,
  Users,
  Landmark,
  ShieldAlert,
  Receipt,
  Briefcase
} from 'lucide-react'
import { UserProfile, NotificationItem } from '../types'

interface NavigationProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  user: UserProfile
  notifications: NotificationItem[]
  language: 'en' | 'ta'
  setLanguage: (lang: 'en' | 'ta') => void
  onLogout: () => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setCurrentPage,
  user,
  notifications,
  language,
  setLanguage,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length

  const navItems = [
    { id: 'dashboard', labelEn: 'Dashboard', labelTa: 'முகப்பு பலகை', icon: LayoutDashboard },
    { id: 'crop-scanner', labelEn: 'AI Crop Scanner', labelTa: 'பயிர் ஸ்கேனர்', icon: ScanLine, highlight: true },
    { id: 'crop-health', labelEn: 'Crop Health & Diseases', labelTa: 'பயிர் ஆரோக்கியம்', icon: Activity },
    { id: 'inventory', labelEn: 'My Harvest Inventory', labelTa: 'அறுவடை இருப்பு', icon: Package },
    { id: 'storage-monitor', labelEn: 'Storage & Spoilage', labelTa: 'சேமிப்பு & கெடுதல்', icon: Warehouse },
    { id: 'market-prices', labelEn: 'Live APMC Mandis', labelTa: 'சந்தை விலைகள்', icon: TrendingUp },
    { id: 'price-forecast', labelEn: 'Price Forecast (AI)', labelTa: 'விலை கணிப்பு', icon: LineChart },
    { id: 'smart-sell', labelEn: 'Smart Sell Advisor', labelTa: 'விற்பனை வழிகாட்டி', icon: BadgeDollarSign, badge: 'High ROI' },

    // NEW MODULES
    { id: 'community', labelEn: 'Farmer Community', labelTa: 'உழவர் சமூகம்', icon: Users, badge: 'Social' },
    { id: 'schemes', labelEn: 'Government Schemes', labelTa: 'அரசு திட்டங்கள்', icon: Landmark, badge: 'DBT' },
    { id: 'crop-insurance', labelEn: 'Crop Insurance', labelTa: 'பயிர் காப்பீடு', icon: ShieldAlert, badge: 'PMFBY' },
    { id: 'expense-scanner', labelEn: 'Expense Scanner', labelTa: 'செலவு ஸ்கேனர்', icon: Receipt, badge: 'OCR' },
    { id: 'business-planner', labelEn: 'Farm Business Planner', labelTa: 'வணிக திட்டம்', icon: Briefcase },

    // PRESERVED AI ASSISTANT, WEATHER, REPORTS, NOTIFICATIONS, SETTINGS
    { id: 'assistant', labelEn: 'AI Agri Assistant', labelTa: 'விவசாய உதவியாளர்', icon: Bot, badge: 'Voice' },
    { id: 'weather', labelEn: 'Weather & Advisory', labelTa: 'வானிலை ஆலோசனை', icon: CloudSun },
    { id: 'reports', labelEn: 'Export Reports (PDF)', labelTa: 'அறிக்கைகள்', icon: FileSpreadsheet },
    { id: 'notifications', labelEn: 'Alerts & Reminders', labelTa: 'எச்சரிக்கைகள்', icon: Bell, count: unreadCount },
    { id: 'settings', labelEn: 'Farm Profile & Config', labelTa: 'சுயவிவரம்', icon: Settings },
  ]

  const getLabel = (item: typeof navItems[0]) => (language === 'ta' ? item.labelTa : item.labelEn)

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-emerald-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center space-x-2" onClick={() => setCurrentPage('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight flex items-center gap-1.5">
              SmartAgri <span className="text-lime-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-700">AI</span>
            </h1>
            <p className="text-[10px] text-emerald-300">Grow Smart • Store Safe • Sell Better</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="px-2 py-1 bg-emerald-900 border border-emerald-700 rounded text-xs text-emerald-200 flex items-center gap-1 font-medium"
          >
            <Languages className="w-3.5 h-3.5" />
            {language === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-emerald-900 text-emerald-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-slate-100 flex flex-col border-r border-emerald-800/60 shadow-xl transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-800/70 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false) }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-emerald-950 font-black shadow-lg">
              <Leaf className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">SmartAgri</span>
                <span className="text-[10px] bg-lime-400/20 text-lime-300 font-bold px-1.5 py-0.5 rounded border border-lime-400/30">AI</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">Grow Smart • Store Safe • Sell Better</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Farmer Location Pill */}
        <div className="px-4 py-2.5 bg-emerald-900/50 mx-4 mt-3 rounded-lg border border-emerald-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="truncate max-w-[140px] font-medium">{user.location}</span>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="text-[11px] font-bold text-lime-300 hover:text-lime-200 flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600"
          >
            <Languages className="w-3 h-3" />
            {language === 'en' ? 'தமிழ்' : 'English'}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-950/40'
                    : 'text-emerald-100/90 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-emerald-950' : 'text-emerald-300'}`} />
                  <span className="tracking-wide">{getLabel(item)}</span>
                </div>
                {item.highlight && !active && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-500/20 text-lime-300 border border-lime-500/30">
                    NVIDIA AI
                  </span>
                )}
                {item.badge && !active && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-800 text-emerald-200">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-emerald-950 text-white' : 'bg-rose-500 text-white'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-emerald-800/80 bg-emerald-950/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 border border-lime-400/50 flex items-center justify-center font-bold text-lime-300 text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate max-w-[130px]">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-300">{user.farmSizeAcres} Acres • Verified</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-emerald-400 hover:text-rose-400 hover:bg-emerald-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 bg-emerald-900/40 px-2 py-1 rounded border border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            <span>Encrypted Farmer Database • Offline Ready</span>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  )
}
