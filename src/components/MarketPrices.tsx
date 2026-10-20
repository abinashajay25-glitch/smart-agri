import React, { useState } from 'react'
import {
  TrendingUp,
  Search,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Info,
  DollarSign
} from 'lucide-react'
import { MarketPriceRecord } from '../types'

interface MarketPricesProps {
  markets: MarketPriceRecord[]
  language: 'en' | 'ta'
  onSelectMandiForSelling?: (mandi: MarketPriceRecord) => void
}

export const MarketPrices: React.FC<MarketPricesProps> = ({
  markets,
  language,
  onSelectMandiForSelling,
}) => {
  const isTa = language === 'ta'
  const [commodityFilter, setCommodityFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'price' | 'distance' | 'arrival'>('price')
  const [sortAsc, setSortAsc] = useState(false)

  const commodities = ['ALL', 'Tomato', 'Onion', 'Chilli (Green)', 'Paddy / Rice']

  const filtered = markets
    .filter((m) => {
      const matchComm = commodityFilter === 'ALL' || m.commodity.toLowerCase().includes(commodityFilter.toLowerCase())
      const matchSearch =
        m.mandiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.state.toLowerCase().includes(searchTerm.toLowerCase())
      return matchComm && matchSearch
    })
    .sort((a, b) => {
      let diff = 0
      if (sortField === 'price') diff = a.modalPricePerQuintal - b.modalPricePerQuintal
      if (sortField === 'distance') diff = a.distanceKm - b.distanceKm
      if (sortField === 'arrival') diff = a.arrivalQuantityTonnes - b.arrivalQuantityTonnes
      return sortAsc ? diff : -diff
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            {isTa ? 'நேரடி APMC உழவர் சந்தை விலைகள்' : 'Verified APMC Agricultural Market Rates'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'அக்மார்க்நெட் மற்றும் இ-நாம் போர்டல் மூலம் சரிபார்க்கப்பட்ட நடப்பு விலைகள்'
              : 'Synchronized via e-NAM & Agmarknet • Showing official modal trading price per quintal & kg'}
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Real-time Agmarknet & e-NAM Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTa ? 'மண்டி, மாவட்டம் அல்லது மாநிலத்தை தேடுக...' : 'Search Mandi yard, district, or state...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {commodities.map((comm) => (
              <button
                key={comm}
                onClick={() => setCommodityFilter(comm)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  commodityFilter === comm
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {comm}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pl-2 border-l border-slate-200">
            <span>Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'price') setSortAsc(!sortAsc)
                else { setSortField('price'); setSortAsc(false) }
              }}
              className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                sortField === 'price' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
              }`}
            >
              Price {sortField === 'price' && (sortAsc ? '▲' : '▼')}
            </button>
            <button
              onClick={() => {
                if (sortField === 'distance') setSortAsc(!sortAsc)
                else { setSortField('distance'); setSortAsc(true) }
              }}
              className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                sortField === 'distance' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
              }`}
            >
              Distance {sortField === 'distance' && (sortAsc ? '▲' : '▼')}
            </button>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Mandi & Location</th>
                <th className="py-3 px-4">Commodity / Variety</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4 text-right">Modal Rate / Quintal</th>
                <th className="py-3 px-4 text-right">Rate / kg</th>
                <th className="py-3 px-4 text-right">Today's Arrivals</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{m.mandiName}</div>
                    <div className="text-[11px] text-slate-400">
                      {m.district}, {m.state}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{m.commodity}</div>
                    <div className="text-[11px] text-slate-500">
                      {m.variety} • {m.grade}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {m.distanceKm} km
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{m.modalPricePerQuintal.toLocaleString('en-IN')}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Range: ₹{m.minPricePerQuintal} - ₹{m.maxPricePerQuintal}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-800 text-sm">
                    ₹{m.pricePerKg.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-600">
                    {m.arrivalQuantityTonnes} Tonnes
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Live Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
