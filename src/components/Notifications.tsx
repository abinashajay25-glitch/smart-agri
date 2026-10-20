import React from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Check
} from 'lucide-react'
import { NotificationItem } from '../types'

interface NotificationsProps {
  notifications: NotificationItem[]
  setNotifications: (notifs: NotificationItem[]) => void
  onNavigate: (page: string) => void
  language: 'en' | 'ta'
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  setNotifications,
  onNavigate,
  language,
}) => {
  const isTa = language === 'ta'

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
  }

  const markSingleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            {isTa ? 'எச்சரிக்கைகள் & நினைவூட்டல்கள்' : 'Alerts, Spoilage Warnings & Reminders'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa ? 'சேமிப்பு அபாயம் மற்றும் சந்தை விலை மாற்றங்கள்' : 'Stay ahead of perishable decay, APMC market spikes, and weather anomalies'}
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          {isTa ? 'அனைத்தையும் படித்ததாகக் குறி' : 'Mark All as Read'}
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const isAlert = n.type === 'ALERT'
          const isInfo = n.type === 'INFO'
          const isSuccess = n.type === 'SUCCESS'

          return (
            <div
              key={n.id}
              onClick={() => markSingleRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.read
                  ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isAlert
                    ? 'bg-rose-100 text-rose-600'
                    : isInfo
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isAlert ? <ShieldAlert className="w-5 h-5" /> : isInfo ? <Info className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {isTa && n.titleTa ? n.titleTa : n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {isTa && n.messageTa ? n.messageTa : n.message}
                </p>
                {n.linkTarget && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate(n.linkTarget!)
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-1"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
