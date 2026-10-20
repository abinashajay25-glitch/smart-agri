import React from 'react'
import {
  Warehouse,
  AlertTriangle,
  Clock,
  Thermometer,
  Droplets,
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { InventoryItem } from '../types'
import { CROP_SHELF_LIFE_RULES } from '../mockAgriData'

interface StorageMonitorProps {
  inventory: InventoryItem[]
  onNavigateToSmartSell: (cropName: string, quantityKg: number) => void
  language: 'en' | 'ta'
}

export const StorageMonitor: React.FC<StorageMonitorProps> = ({
  inventory,
  onNavigateToSmartSell,
  language,
}) => {
  const isTa = language === 'ta'

  // Sort by urgency: shortest days remaining first
  const sorted = [...inventory].sort((a, b) => a.daysRemaining - b.daysRemaining)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Warehouse className="w-6 h-6 text-emerald-600" />
          {isTa ? 'சேமிப்புக் கிடங்கு கண்காணிப்பு & கெடுதல் தடுப்பு' : 'Storage Environmental Monitor & Spoilage Prevention'}
        </h1>
        <p className="text-xs text-slate-500">
          {isTa
            ? 'அறுவடை தேதிகள், சேமிப்பு வெப்பநிலை, மீதமுள்ள நாட்கள் மற்றும் முன்கூட்டியே விற்கும் முன்னுரிமை'
            : 'Priority liquidation queue calibrated by crop respiration rates and warehouse humidity'}
        </p>
      </div>

      {/* Priority Spoilage Alert Queue */}
      <div className="space-y-4">
        {sorted.map((item, idx) => {
          const rule = CROP_SHELF_LIFE_RULES[item.cropName]
          const isCritical = item.spoilageRisk === 'CRITICAL' || item.spoilageRisk === 'HIGH'

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                  : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      #{idx + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{item.cropName}</h3>
                    <span className="text-xs text-slate-500">({item.variety || 'Local'})</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        item.spoilageRisk === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : item.spoilageRisk === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : item.spoilageRisk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {item.spoilageRisk} SPOILAGE RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Location: <strong className="text-slate-700">{item.storageLocation}</strong> • Condition: <strong className="text-slate-700 capitalize">{item.storageCondition.replace('_', ' ')}</strong> • Harvested: {item.harvestDate}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-auto">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Remaining Life</span>
                    <span className={`text-2xl font-black ${isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.daysRemaining} Days
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      of {item.estimatedShelfLifeDays} total days
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateToSmartSell(item.cropName, item.quantityKg)}
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Smart Sell</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Environmental metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Thermometer className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>
                    Optimal Temp: <strong>{rule?.tempOptimal || '15°C - 20°C'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Droplets className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>
                    Optimal Humidity: <strong>{rule?.humidityOptimal || '75%'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="truncate">Signs: {rule?.spoilageSigns || 'Softening & decay'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
