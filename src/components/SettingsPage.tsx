import React, { useState } from 'react'
import {
  User,
  Settings,
  Languages,
  MapPin,
  Save,
  CheckCircle,
  Building,
  Key,
  ShieldCheck,
  Cpu
} from 'lucide-react'
import { UserProfile } from '../types'

interface SettingsProps {
  user: UserProfile
  setUser: (u: UserProfile) => void
  language: 'en' | 'ta'
  setLanguage: (l: 'en' | 'ta') => void
}

export const SettingsPage: React.FC<SettingsProps> = ({
  user,
  setUser,
  language,
  setLanguage,
}) => {
  const isTa = language === 'ta'
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [location, setLocation] = useState(user.location)
  const [farmSize, setFarmSize] = useState(user.farmSizeAcres)
  const [storageType, setStorageType] = useState(user.storageType)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: UserProfile = {
      ...user,
      name,
      phone,
      location,
      farmSizeAcres: Number(farmSize) || 5,
      storageType,
      preferredLanguage: language,
    }
    setUser(updated)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          {isTa ? 'விவசாயி விவரம் & கணக்கு அமைப்புகள்' : 'Farmer Profile & Application Settings'}
        </h1>
        <p className="text-xs text-slate-500">
          {isTa ? 'உங்கள் நிலத்தின் அளவு, இருப்பிடம் மற்றும் மொழி விருப்பங்களை மாற்றவும்' : 'Manage your farm location, preferred language, and regional warehousing configurations'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Farmer Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Farm Region / District</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dindigul, Tamil Nadu / Nashik"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Total Holding (Acres)</label>
              <input
                type="number"
                value={farmSize}
                onChange={(e) => setFarmSize(Number(e.target.value))}
                min={0.5}
                step={0.5}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Storage Facility</label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ventilated_warehouse">Ventilated Warehouse (காற்றோட்டம்)</option>
                <option value="traditional_shed">Traditional Farm Shed (பாரம்பரிய கொட்டகை)</option>
                <option value="cold_storage">Commercial Cold Storage (குளிர்பதன கிடங்கு)</option>
                <option value="silo">Hermetic Silo (தானிய கிடங்கு)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Interface Language</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors ${
                    language === 'en'
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ta')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors ${
                    language === 'ta'
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              {savedSuccess && (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Profile updated successfully!
                </>
              )}
            </span>
            <button
              type="submit"
              className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-950/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-lime-400" />
              Save Profile Settings
            </button>
          </div>
        </form>

        {/* AI & Integration Status */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-600" />
            AI & Backend Services Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>NVIDIA NIM Vision (Llama-3.2 Vision) Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ElevenLabs Multilingual Speech Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>e-NAM / Agmarknet Market Feeds Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Local Storage Offline Sync Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
