import React, { useState } from 'react'
import {
  Landmark,
  Search,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react'
import { GovtScheme, UserProfile } from '../types'
import { getStoredGovtSchemes, getSavedSchemeIds, saveSavedSchemeIds } from '../storageService'

interface SchemeFinderProps {
  user: UserProfile
  language: 'en' | 'ta'
}

export const SchemeFinder: React.FC<SchemeFinderProps> = ({ user, language }) => {
  const isTa = language === 'ta'
  const allSchemes = getStoredGovtSchemes()

  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(() => getSavedSchemeIds(user.id))
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [onlySaved, setOnlySaved] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null)

  // Interactive document checklist state: schemeId -> Record<docName, boolean>
  const [checklistProgress, setChecklistProgress] = useState<Record<string, Record<string, boolean>>>({})

  const toggleSaveScheme = (schemeId: string) => {
    const isSaved = savedSchemeIds.includes(schemeId)
    const updated = isSaved
      ? savedSchemeIds.filter(id => id !== schemeId)
      : [...savedSchemeIds, schemeId]
    setSavedSchemeIds(updated)
    saveSavedSchemeIds(user.id, updated)
  }

  const toggleChecklistItem = (schemeId: string, doc: string) => {
    const schemeDocs = checklistProgress[schemeId] || {}
    const updatedSchemeDocs = {
      ...schemeDocs,
      [doc]: !schemeDocs[doc]
    }
    setChecklistProgress({
      ...checklistProgress,
      [schemeId]: updatedSchemeDocs
    })
  }

  // Filter schemes
  const filteredSchemes = allSchemes.filter(scheme => {
    if (onlySaved && !savedSchemeIds.includes(scheme.id)) return false
    if (categoryFilter !== 'ALL' && scheme.category !== categoryFilter) return false

    const query = searchTerm.toLowerCase()
    const matchesSearch =
      scheme.name.toLowerCase().includes(query) ||
      scheme.nameTa.toLowerCase().includes(query) ||
      scheme.benefits.toLowerCase().includes(query) ||
      scheme.targetCrops.some(c => c.toLowerCase().includes(query)) ||
      scheme.category.toLowerCase().includes(query)

    return matchesSearch
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            {isTa ? 'அரசு நலத்திட்டங்கள் & மானிய வழிகாட்டி' : 'Government Scheme & Subsidy Eligibility Finder'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'உங்கள் நில அளவு, பயிர் மற்றும் மாநிலத்திற்குரிய அதிகாரப்பூர்வ மத்திய/மாநில அரசு திட்டங்கள்'
              : `Personalized discovery for your ${user.farmSizeAcres} Acre holding (${user.primaryCrops.join(', ')}) with official portal links`}
          </p>
        </div>

        <button
          onClick={() => setOnlySaved(!onlySaved)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto border ${
            onlySaved
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {onlySaved ? <BookmarkCheck className="w-4 h-4 text-lime-400" /> : <Bookmark className="w-4 h-4 text-emerald-700" />}
          <span>{isTa ? `சேமிக்கப்பட்டவை (${savedSchemeIds.length})` : `Saved Schemes (${savedSchemeIds.length})`}</span>
        </button>
      </div>

      {/* Mandatory Official Disclaimer & Legal Transparency */}
      <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-2xl text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-sm block">
            {isTa ? 'அதிகாரப்பூர்வ அரசு வழிகாட்டுதல் & பொறுப்புத்துறப்பு' : 'Official Portal Transparency & Eligibility Notice'}
          </span>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            SmartAgri AI serves as an informational discovery tool aggregating verified guidelines from the Ministry of Agriculture & Farmers Welfare. We do <strong>not</strong> guarantee eligibility or disburse funds. Official applications must be completed on verified government portals (.gov.in / .nic.in) or at authorized CSC / PACS centers.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTa ? 'திட்டத்தின் பெயர் அல்லது பயிரை தேடுக (எ.கா. PM-KISAN, சொட்டு நீர் பாசனம், PMFBY)...' : 'Search scheme name, crop, or benefits (e.g. PM-KISAN, Micro Irrigation, Drip, PMFBY)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'Financial Assistance', 'Crop Insurance', 'Irrigation & Subsidies', 'Inputs & Machinery', 'Storage & Cold Chain'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((scheme) => {
          const isSaved = savedSchemeIds.includes(scheme.id)
          const schemeDocsState = checklistProgress[scheme.id] || {}
          const completedDocsCount = scheme.requiredDocuments.filter(d => schemeDocsState[d]).length
          const totalDocs = scheme.requiredDocuments.length

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Title & Save Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {scheme.scope} • {scheme.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug pt-1">
                      {scheme.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{scheme.nameTa}</p>
                  </div>

                  <button
                    onClick={() => toggleSaveScheme(scheme.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50 transition-colors"
                    title={isSaved ? 'Remove from saved' : 'Save scheme'}
                  >
                    {isSaved ? <BookmarkCheck className="w-5 h-5 text-emerald-700 fill-emerald-100" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                {/* Key Benefits */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-1 text-xs">
                  <span className="font-bold text-emerald-950 block">Direct Financial Benefits:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {isTa ? scheme.benefitsTa : scheme.benefits}
                  </p>
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-800 block">Key Eligibility Requirements:</span>
                  <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                    {scheme.eligibilityCriteria.map((crit, idx) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                </div>

                {/* Document Readiness Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      Required Document Readiness
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-800">
                      {completedDocsCount} / {totalDocs} Prepared
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {scheme.requiredDocuments.map((doc, idx) => {
                      const checked = Boolean(schemeDocsState[doc])
                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecklistItem(scheme.id, doc)}
                            className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className={checked ? 'line-through opacity-70' : ''}>{doc}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Source Verification Date */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Last Verified: {scheme.lastVerifiedDate}</span>
                  <span className="text-emerald-700 font-semibold">{scheme.portalName}</span>
                </div>
              </div>

              {/* Action Buttons: Apply on Official Portal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[170px]">{scheme.applicationDeadline}</span>
                </div>

                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/20"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-lime-400" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            {isTa ? 'பொருந்தும் அரசு திட்டங்கள் எதுவும் இல்லை' : 'No Government Schemes Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isTa ? 'வேறு தேடல் சொற்களை பயன்படுத்தவும் அல்லது வடிகட்டியை மாற்றவும்.' : 'Try clearing your search query or reset the category filter.'}
          </p>
        </div>
      )}
    </div>
  )
}
