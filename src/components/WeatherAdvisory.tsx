import React from 'react'
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react'
import { getAgriculturalWeather } from '../calculationEngine'

interface WeatherProps {
  language: 'en' | 'ta'
  location: string
}

export const WeatherAdvisory: React.FC<WeatherProps> = ({ language, location }) => {
  const isTa = language === 'ta'
  const weather = getAgriculturalWeather(location)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-emerald-600" />
          {isTa ? 'வானிலை & வேளாண்மை சேமிப்பு ஆலோசனை' : 'Agricultural Weather & Storage Advisory'}
        </h1>
        <p className="text-xs text-slate-500">
          {isTa
            ? 'வானிலை முன்னறிவிப்பு மற்றும் அறுவடைக்குப் பின் பாதுகாப்பு வழிமுறைகள்'
            : 'Pre-flight meteorological feeds tailored for harvest picking, sun-drying, and transit risk'}
        </p>
      </div>

      {/* Current Conditions Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 rounded-2xl p-6 text-white shadow-lg border border-emerald-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <MapPin className="w-4 h-4 text-lime-400" />
              <span>{weather.city}</span>
              <span>• Live Observation</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black tracking-tight text-white">
                {weather.temperature}°C
              </span>
              <span className="text-sm font-semibold text-emerald-200">
                Feels like {weather.feelsLike}°C
              </span>
            </div>
            <p className="text-sm font-bold text-lime-300">{weather.condition}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-xs text-xs">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-slate-300 text-[10px] block">Relative Humidity</span>
                <span className="font-extrabold text-white text-sm">{weather.humidity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-300" />
              <div>
                <span className="text-slate-300 text-[10px] block">Cross Wind</span>
                <span className="font-extrabold text-white text-sm">14 km/h SW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory highlight */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80 space-y-2">
          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">Post-Harvest Storage Alert:</span>
              <span>{weather.storageRiskAlert}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Day Agricultural Forecast */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          {isTa ? 'அடுத்த 6 நாட்களுக்கான முன்னறிவிப்பு & பண்ணை பணிகள்' : '6-Day Agricultural Action Forecast'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {weather.forecast.map((f, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/50 transition-colors flex flex-col justify-between space-y-2 text-center"
            >
              <div>
                <span className="font-black text-xs text-slate-700 block">{f.day}</span>
                <span className="text-xl font-black text-slate-900 block mt-1">{f.temp}°C</span>
                <span className="text-[11px] text-slate-500 block truncate">{f.condition}</span>
              </div>

              <div className="text-[10px] bg-white p-1.5 rounded-lg border border-slate-200 font-semibold text-emerald-800 text-left">
                Rain: {f.rainProb}%
                <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">{f.advisory}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
