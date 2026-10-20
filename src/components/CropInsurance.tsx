import React, { useState } from 'react'
import {
  ShieldAlert,
  FileCheck,
  PlusCircle,
  AlertTriangle,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Camera,
  Layers,
  ChevronRight,
  Info,
  Building,
  Upload,
  X,
  ShieldCheck
} from 'lucide-react'
import { InsurancePolicy, DamageClaim, UserProfile } from '../types'
import {
  getStoredInsurancePolicies,
  saveStoredInsurancePolicies,
  getStoredDamageClaims,
  saveStoredDamageClaims,
  addNotification
} from '../storageService'

interface CropInsuranceProps {
  user: UserProfile
  language: 'en' | 'ta'
}

export const CropInsurance: React.FC<CropInsuranceProps> = ({ user, language }) => {
  const isTa = language === 'ta'

  const [policies, setPolicies] = useState<InsurancePolicy[]>(() => getStoredInsurancePolicies(user.id))
  const [claims, setClaims] = useState<DamageClaim[]>(() => getStoredDamageClaims(user.id))

  // New claim modal state
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false)
  const [claimCrop, setClaimCrop] = useState('Tomato')
  const [claimPolicyId, setClaimPolicyId] = useState(policies[0]?.id || '')
  const [damageDate, setDamageDate] = useState(new Date().toISOString().slice(0, 10))
  const [affectedAcres, setAffectedAcres] = useState<number>(1.0)
  const [damageCause, setDamageCause] = useState<DamageClaim['causeOfDamage']>('Inundation/Flood')
  const [damageDescription, setDamageDescription] = useState('')

  // New policy modal state
  const [isNewPolicyOpen, setIsNewPolicyOpen] = useState(false)
  const [policyScheme, setPolicyScheme] = useState('PM Fasal Bima Yojana (PMFBY)')
  const [policyNumber, setPolicyNumber] = useState('')
  const [insurerName, setInsurerName] = useState('Agriculture Insurance Company of India (AIC)')
  const [insuredCrop, setInsuredCrop] = useState('Tomato')
  const [insuredAcres, setInsuredAcres] = useState<number>(3.0)
  const [sumInsured, setSumInsured] = useState<number>(150000)
  const [premiumPaid, setPremiumPaid] = useState<number>(3000)
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif')

  const handleRegisterClaim = (e: React.FormEvent) => {
    e.preventDefault()

    const claimRef = `PMFBY-CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const newClaim: DamageClaim = {
      id: `claim-${Date.now()}`,
      userId: user.id,
      policyId: claimPolicyId || undefined,
      cropName: claimCrop,
      damageDate,
      affectedAreaAcres: Number(affectedAcres) || 1.0,
      causeOfDamage: damageCause,
      description: damageDescription.trim(),
      claimStatus: 'INTIMATED',
      claimStatusNotes: 'Claim intimation logged. Document checklist generated. Contact VAO or Toll-Free 1800-180-1551 to confirm joint field loss survey.',
      claimReferenceNumber: claimRef,
      requiredChecklist: [
        { document: 'PMFBY Insurance Policy Certificate / Application ID', completed: true },
        { document: 'Land Record Copy (Patta / Chitta / 7/12 extract)', completed: true },
        { document: 'Sowing Certificate from Village Administrative Officer (VAO)', completed: false },
        { document: 'Geo-tagged field photographs showing crop damage', completed: false },
        { document: 'Bank Account Passbook with IFSC', completed: true },
        { document: 'Joint Survey Loss Assessment Sheet (signed with surveyor)', completed: false }
      ],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    const updated = [newClaim, ...claims]
    setClaims(updated)
    saveStoredDamageClaims(user.id, updated)

    // Add risk notification
    addNotification({
      title: `Crop Damage Intimation Logged: ${claimCrop}`,
      titleTa: `பயிர் சேத இழப்பீடு பதிவு: ${claimCrop}`,
      message: `Damage claim ${claimRef} initiated for ${affectedAcres} acres due to ${damageCause}. Maintain policy documents ready for field survey.`,
      messageTa: `${claimCrop} பயிருக்கு ${affectedAcres} ஏக்கர் சேத இழப்பீடு கோரிக்கை ${claimRef} பதிவு செய்யப்பட்டுள்ளது.`,
      type: 'ALERT',
      linkTarget: 'crop-insurance'
    })

    setDamageDescription('')
    setIsNewClaimOpen(false)
  }

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault()

    const newPol: InsurancePolicy = {
      id: `pol-${Date.now()}`,
      userId: user.id,
      schemeName: policyScheme,
      policyNumber: policyNumber || `PMFBY-${Date.now().toString().slice(-6)}`,
      insurerName,
      cropName: insuredCrop,
      insuredAreaAcres: Number(insuredAcres) || 2.0,
      sumInsuredINR: Number(sumInsured) || 100000,
      premiumPaidINR: Number(premiumPaid) || 2000,
      season,
      year: new Date().getFullYear(),
      coverageStartDate: new Date().toISOString().slice(0, 10),
      coverageEndDate: new Date(Date.now() + 150 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      intimationDeadlineHours: 72,
      status: 'ACTIVE'
    }

    const updated = [newPol, ...policies]
    setPolicies(updated)
    saveStoredInsurancePolicies(user.id, updated)

    setPolicyNumber('')
    setIsNewPolicyOpen(false)
  }

  const toggleClaimChecklistItem = (claimId: string, docIdx: number) => {
    const updated = claims.map(c => {
      if (c.id !== claimId) return c
      const newChecklist = [...c.requiredChecklist]
      newChecklist[docIdx] = {
        ...newChecklist[docIdx],
        completed: !newChecklist[docIdx].completed
      }
      return {
        ...c,
        requiredChecklist: newChecklist,
        lastUpdated: new Date().toISOString()
      }
    })
    setClaims(updated)
    saveStoredDamageClaims(user.id, updated)
  }

  const updateClaimStatus = (claimId: string, newStatus: DamageClaim['claimStatus']) => {
    const updated = claims.map(c => {
      if (c.id !== claimId) return c
      return {
        ...c,
        claimStatus: newStatus,
        lastUpdated: new Date().toISOString()
      }
    })
    setClaims(updated)
    saveStoredDamageClaims(user.id, updated)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            {isTa ? 'பயிர் காப்பீடு & சேத இழப்பீட்டு உதவியாளர்' : 'Crop Insurance & Damage Claim Assistant'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY) 72 மணி நேர இழப்பீட்டு பதிவு மற்றும் ஆவண வழிகாட்டி'
              : 'Register active policies, generate 72-hour disaster intimation dossiers, and track surveyor inspection status'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsNewPolicyOpen(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Building className="w-4 h-4 text-emerald-600" />
            {isTa ? 'காப்பீடு பதிவு செய்க' : 'Add Policy'}
          </button>
          <button
            onClick={() => setIsNewClaimOpen(true)}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/20"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            {isTa ? 'சேத அறிக்கை பதிவு' : 'Report Crop Damage'}
          </button>
        </div>
      </div>

      {/* Critical 72-Hour Rule Notice */}
      <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl text-xs space-y-1 text-rose-950 shadow-xs">
        <span className="font-extrabold text-sm flex items-center gap-1.5 text-rose-900">
          <Clock className="w-4 h-4 text-rose-600 animate-pulse" />
          Mandatory PMFBY 72-Hour Localized Calamity Intimation Rule
        </span>
        <p className="text-rose-800 text-[11px] leading-relaxed">
          In case of localized calamities like hailstorms, flash floods, or post-harvest cyclonic inundation, the Government of India requires farmers to notify within <strong>72 hours</strong> via the PMFBY Portal, the Crop Insurance App, or the National Toll-Free Number <strong>1800-180-1551</strong>.
        </p>
      </div>

      {/* Active Policies Carousel/Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isTa ? 'செயலில் உள்ள பயிர் காப்பீட்டு பாலிசிகள்' : 'Active Insurance Policies on File'}
          </h2>
          <span className="text-xs text-slate-400">{policies.length} Registered</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div
              key={pol.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {pol.season} {pol.year} • {pol.status}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                    {pol.schemeName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Policy No: {pol.policyNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-800">
                    ₹{pol.sumInsuredINR.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Sum Insured</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400">Insured Crop</span>
                  <span className="font-bold text-slate-900">{pol.cropName}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Covered Area</span>
                  <span className="font-bold text-slate-900">{pol.insuredAreaAcres} Acres</span>
                </div>
                <div>
                  <span className="block text-slate-400">Farmer Premium</span>
                  <span className="font-bold text-emerald-700">₹{pol.premiumPaidINR}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Insurer: {pol.insurerName}</span>
                <span>Valid: {pol.coverageEndDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Damage Claims List with Interactive Document Dossier */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-rose-600" />
          {isTa ? 'பதிவு செய்யப்பட்ட சேத இழப்பீட்டு கோரிக்கைகள்' : 'Crop Damage Claims & Verification Progress'}
        </h2>

        {claims.map((claim) => {
          const completedCount = claim.requiredChecklist.filter(d => d.completed).length
          const totalDocs = claim.requiredChecklist.length

          return (
            <div
              key={claim.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{claim.cropName} Damage</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Cause: {claim.causeOfDamage}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Ref: {claim.claimReferenceNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Affected Area: <strong className="text-slate-700">{claim.affectedAreaAcres} Acres</strong> • Incident Date: <strong className="text-slate-700">{claim.damageDate}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <select
                    value={claim.claimStatus}
                    onChange={(e) => updateClaimStatus(claim.id, e.target.value as any)}
                    className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-300 text-slate-800 focus:outline-none"
                  >
                    <option value="INTIMATED">INTIMATED (அறிவிக்கப்பட்டது)</option>
                    <option value="SURVEY_SCHEDULED">SURVEY SCHEDULED (கள ஆய்வு)</option>
                    <option value="ASSESSMENT_COMPLETED">ASSESSMENT COMPLETED (மதிப்பீடு முடிவு)</option>
                    <option value="SETTLEMENT_APPROVED">SETTLEMENT APPROVED (ஒப்புதல்)</option>
                    <option value="DISBURSED">DISBURSED (பணம் வழங்கப்பட்டது)</option>
                  </select>
                </div>
              </div>

              {/* Description & Surveyor Notes */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-700 block">Incident Observation:</span>
                <p className="text-slate-600">{claim.description}</p>
                {claim.claimStatusNotes && (
                  <div className="pt-2 text-emerald-800 font-medium">
                    📌 {claim.claimStatusNotes}
                  </div>
                )}
              </div>

              {/* Required Claim Dossier Checklist */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    Claim Verification Document Dossier Checklist
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-800">
                    {completedCount} / {totalDocs} Documents Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {claim.requiredChecklist.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleClaimChecklistItem(claim.id, idx)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className={`text-[11px] leading-tight ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {item.document}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Official Action Portal Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Last Updated: {new Date(claim.lastUpdated).toLocaleDateString()}
                </span>
                <a
                  href="https://pmfby.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg font-bold flex items-center gap-1 border border-emerald-200"
                >
                  <span>PMFBY Claim Tracking Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                </a>
              </div>
            </div>
          )
        })}

        {claims.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Active Damage Claims</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your registered plots have zero recorded damage incidents. If an unforeseen weather calamity occurs, log it within 72 hours above.
            </p>
          </div>
        )}
      </div>

      {/* New Crop Damage Modal */}
      {isNewClaimOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                {isTa ? 'பயிர் சேத இழப்பீட்டு அறிவிக்கை' : 'Initiate Crop Damage Intimation'}
              </h2>
              <button
                onClick={() => setIsNewClaimOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterClaim} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Affected Crop</label>
                  <select
                    value={claimCrop}
                    onChange={(e) => setClaimCrop(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Tomato">Tomato (தக்காளி)</option>
                    <option value="Onion">Onion (வெங்காயம்)</option>
                    <option value="Paddy / Rice">Paddy / Rice (நெல்)</option>
                    <option value="Chilli (Green)">Chilli (Green) (பச்சை மிளகாய்)</option>
                    <option value="Cotton">Cotton (பருத்தி)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Damage Date</label>
                  <input
                    type="date"
                    value={damageDate}
                    onChange={(e) => setDamageDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Affected Area (Acres)</label>
                  <input
                    type="number"
                    value={affectedAcres}
                    onChange={(e) => setAffectedAcres(Number(e.target.value))}
                    step={0.1}
                    min={0.1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Calamity Cause</label>
                  <select
                    value={damageCause}
                    onChange={(e) => setDamageCause(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Inundation/Flood">Inundation / Flash Floods (வெள்ளம்)</option>
                    <option value="Hailstorm">Hailstorm (ஆலங்கட்டி மழை)</option>
                    <option value="Post-Harvest Rains">Post-Harvest Rains on Threshing Floor</option>
                    <option value="Pest/Disease Outbreak">Severe Pest Outbreak (பூச்சி நோய்)</option>
                    <option value="Drought">Drought / Dry Spell (வறட்சி)</option>
                    <option value="Cyclone">Cyclone / Heavy Gale Winds (புயல்)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description of Loss & Field Symptoms</label>
                <textarea
                  rows={3}
                  placeholder="Detail extent of flooding, fruit rot, vine submergence, or hailstorm physical damage..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewClaimOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold transition-colors shadow-md shadow-rose-950/20"
                >
                  File Claim Intimation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Policy Modal */}
      {isNewPolicyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                {isTa ? 'புதிய பயிர் காப்பீட்டு பாலிசி பதிவு' : 'Register Crop Insurance Policy'}
              </h2>
              <button
                onClick={() => setIsNewPolicyOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheme</label>
                  <select
                    value={policyScheme}
                    onChange={(e) => setPolicyScheme(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="PM Fasal Bima Yojana (PMFBY)">PMFBY (National)</option>
                    <option value="Restructured Weather Based Crop Insurance (RWBCIS)">RWBCIS (Weather Based)</option>
                    <option value="State Horticultural Special Cover">State Horticultural Scheme</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Policy / Application ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PMFBY-2026-TN-449"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Insured Crop</label>
                  <select
                    value={insuredCrop}
                    onChange={(e) => setInsuredCrop(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Paddy / Rice">Paddy / Rice</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Chilli (Green)">Chilli (Green)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Insured Acres</label>
                  <input
                    type="number"
                    value={insuredAcres}
                    onChange={(e) => setInsuredAcres(Number(e.target.value))}
                    step={0.5}
                    min={0.5}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sum Insured (INR)</label>
                  <input
                    type="number"
                    value={sumInsured}
                    onChange={(e) => setSumInsured(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Premium Paid (INR)</label>
                  <input
                    type="number"
                    value={premiumPaid}
                    onChange={(e) => setPremiumPaid(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPolicyOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-950/20"
                >
                  Save Policy Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
