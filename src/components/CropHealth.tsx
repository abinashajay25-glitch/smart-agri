import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Info,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react'

interface CropHealthProps {
  language: 'en' | 'ta'
}

export const CropHealth: React.FC<CropHealthProps> = ({ language }) => {
  const isTa = language === 'ta'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('Tomato')

  const diseases = [
    {
      crop: 'Tomato',
      name: 'Early Blight (Alternaria solani)',
      nameTa: 'ஆரம்பகால கருகல் நோய்',
      symptoms: 'Concentric dark rings (target board pattern) on lower foliage and fruit stem lesions.',
      preventive: 'Ensure proper plant spacing for aeration, avoid overhead sprinkler irrigation, apply Trichoderma viride.',
      chemical: 'Mancozeb 75% WP @ 2g/litre or Azoxystrobin 23% SC @ 1ml/litre if severity exceeds 15%.',
      verifiedModelSupported: true,
    },
    {
      crop: 'Tomato',
      name: 'Tomato Leaf Curl Virus (ToLCV)',
      nameTa: 'இலை சுருள் நச்சுயிரி',
      symptoms: 'Severe upward curling and crinkling of leaves, stunted bushy growth, flower drop.',
      preventive: 'Control vector Whiteflies (Bemisia tabaci) using yellow sticky traps (15 traps/acre).',
      chemical: 'Foliar spray of Imidacloprid 17.8% SL @ 0.5ml/litre or Neem oil 10,000 ppm @ 3ml/litre.',
      verifiedModelSupported: true,
    },
    {
      crop: 'Onion',
      name: 'Purple Blotch (Alternaria porri)',
      nameTa: 'ஊதா நிற புள்ளி நோய்',
      symptoms: 'Small water-soaked lesions on leaves rapidly developing sunken purple center with chlorotic yellow halo.',
      preventive: 'Crop rotation with non-allium crops, balanced nitrogen application (avoid excess urea).',
      chemical: 'Difenoconazole 25% EC @ 1ml/litre or Copper Oxychloride 50% WP @ 2.5g/litre.',
      verifiedModelSupported: true,
    },
    {
      crop: 'Chilli (Green)',
      name: 'Anthracnose / Die Back (Colletotrichum capsici)',
      nameTa: 'பழ அழுகல் / நுனிக் கருகல்',
      symptoms: 'Circular sunken black lesions on ripe pods with salmon-colored gelatinous spore masses.',
      preventive: 'Seed treatment with Thiram 3g/kg seed, eradicate infected fruit debris after picking.',
      chemical: 'Propiconazole 25% EC @ 1ml/litre or Carbendazim 50% WP @ 1g/litre at flowering onset.',
      verifiedModelSupported: true,
    },
  ]

  const filtered = diseases.filter(
    (d) =>
      d.crop.toLowerCase().includes(selectedCrop.toLowerCase()) &&
      (d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-600" />
          {isTa ? 'பயிர் ஆரோக்கியம் & அங்கீகரிக்கப்பட்ட நோய் வழிகாட்டி' : 'Crop Health, Agronomic Pathology & Disease Guide'}
        </h1>
        <p className="text-xs text-slate-500">
          {isTa
            ? 'அங்கீகரிக்கப்பட்ட வேளாண் ஆராய்ச்சி கவுன்சில் (ICAR) வழிகாட்டுதல்கள்'
            : 'Evidence-based pathology guidelines aligned with Indian Council of Agricultural Research (ICAR)'}
        </p>
      </div>

      {/* Model Transparency Alert */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-sm block">
            Agronomic Protocol Compliance
          </span>
          <p className="text-sky-800 leading-relaxed">
            SmartAgri AI will only report a verified diagnosis if visual image evidence matches established morphological features of the pathogen. When confidence is inconclusive, safe general advisory is shown without fabricating disease occurrence.
          </p>
        </div>
      </div>

      {/* Selector and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['Tomato', 'Onion', 'Chilli (Green)'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCrop === c
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symptoms or treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Disease Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {d.crop} Pathology
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{d.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{d.nameTa}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Model
                </span>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Identifiable Symptoms:</span>
                  <p className="text-slate-600 mt-0.5">{d.symptoms}</p>
                </div>
                <div>
                  <span className="font-bold text-emerald-800 block">Agronomic & Preventive Measures:</span>
                  <p className="text-slate-600 mt-0.5">{d.preventive}</p>
                </div>
                <div>
                  <span className="font-bold text-amber-800 block">Recommended Field Treatment:</span>
                  <p className="text-slate-600 mt-0.5">{d.chemical}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
