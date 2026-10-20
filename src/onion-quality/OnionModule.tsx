import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type {
  ImageQualityValidation,
  OnionAnalysisResult,
  OnionAnalyticsRecord,
  OnionGradingRules,
  OnionItem,
  OnionSampleForm,
} from './types'
import { DEFAULT_GRADING_RULES, computeGrading } from './gradingEngine'
import { validateOnionImage } from './imageValidator'
import { generateOnionPdfReport } from './reportGenerator'

export function OnionModule() {
  const [form, setForm] = useState<OnionSampleForm>({
    procurementCentre: 'Lasalgaon Mandi (NAFED Hub)',
    sampleId: `SAM-ONION-${Date.now().toString().slice(-6)}`,
    inspectorName: 'Officer R. K. Sharma',
    inspectorId: 'DoCA-INSP-409',
    dateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    onionVariety: 'Nashik Red (Garwa)',
    location: 'Shed 4B, Procurement Yard 2',
    sampleWeightKg: 10.0,
    sampleQuantityEst: 85,
    batchNumber: 'LOT-2026-NASHIK-092',
    notes: 'Random 10-kg grid sample taken from truck loading platform.',
  })

  const [rules, setRules] = useState<OnionGradingRules>(DEFAULT_GRADING_RULES)
  const [activeTab, setActiveTab] = useState<'assessment' | 'history' | 'analytics' | 'settings'>('assessment')

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageValidation, setImageValidation] = useState<ImageQualityValidation | null>(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<OnionAnalysisResult | null>(null)
  const [selectedOnionId, setSelectedOnionId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [history, setHistory] = useState<OnionAnalyticsRecord[]>([])
  const [speechStatus, setSpeechStatus] = useState<'READY' | 'READING' | 'STOPPED'>('READY')
  const [language, setLanguage] = useState<'English' | 'हिन्दी' | 'தமிழ்'>('English')

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rockstar-lens-onion-history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      setImageValidation(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    validateOnionImage(url).then(setImageValidation)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleInputChange = (field: keyof OnionSampleForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError('Please choose a valid JPG, PNG, or WEBP onion image.')
      return
    }
    setFile(selected)
    setAnalysis(null)
    setError('')
  }

  const openCamera = async () => {
    setCameraError('')
    setIsCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setCameraError('Camera access is unavailable. Please upload an image instead.')
    }
  }

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const capFile = new File([blob], `onion-sample-${Date.now()}.jpg`, { type: 'image/jpeg' })
          setFile(capFile)
          setAnalysis(null)
          setError('')
        }
        closeCamera()
      },
      'image/jpeg',
      0.92
    )
  }

  const runAnalysis = async () => {
    if (!form.procurementCentre || !form.sampleId || !form.inspectorName || !form.onionVariety) {
      setError('Please fill in all required sample fields before running AI analysis.')
      return
    }

    if (!file && !previewUrl) {
      setError('Please upload or capture an onion sample image.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const body = new FormData()
      if (file) {
        body.append('image', file)
      } else if (previewUrl) {
        const fetchRes = await fetch(previewUrl)
        const blob = await fetchRes.blob()
        body.append('image', new File([blob], 'demo-sample.jpg', { type: 'image/jpeg' }))
      }

      const response = await fetch('/api/onion/analyze', {
        method: 'POST',
        headers: {
          'x-sample-id': form.sampleId,
          'x-grading-rules': JSON.stringify(rules),
        },
        body,
      })

      if (!response.ok) {
        throw new Error('Onion vision service returned an error.')
      }

      const raw = await response.json()
      const rawItems: OnionItem[] = Array.isArray(raw.items) ? raw.items : []

      // Calculate grading via configurable engine
      const { items: evaluatedItems, summary } = computeGrading(rawItems, rules)

      const avgConf =
        evaluatedItems.length > 0
          ? evaluatedItems.reduce((acc, curr) => acc + curr.confidence, 0) / evaluatedItems.length
          : 0.85
      const lowConfFlag = avgConf < 0.65
      const confLevel = avgConf >= 0.8 ? 'HIGH' : avgConf >= 0.65 ? 'MEDIUM' : 'LOW'

      const resultPayload: OnionAnalysisResult = {
        reportId: `DOCA-ONION-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toISOString(),
        provider: raw.provider || 'Multimodal Vision Engine',
        modelVersion: 'DoCA-OnionVision-v2.5',
        rulesVersion: rules.ruleVersion,
        imageValidation: imageValidation || {
          isValid: true,
          brightnessScore: 78,
          sharpnessScore: 82,
          isBlurry: false,
          hasOverlappingOnions: false,
          isLightingPoor: false,
          warnings: [],
        },
        sampleInfo: { ...form },
        items: evaluatedItems,
        gradingSummary: summary,
        gradingRules: rules,
        averageConfidence: avgConf,
        lowConfidenceFlag: lowConfFlag,
        overallConfidenceLevel: confLevel,
        findings: Array.isArray(raw.findings) ? raw.findings : [summary.verdictMessage],
        recommendedActions: Array.isArray(raw.recommendedActions)
          ? raw.recommendedActions
          : ['Proceed with digital report generation.', 'Store analysis token in procurement log.'],
      }

      setAnalysis(resultPayload)

      // Save record to local analytics history
      const analyticsEntry: OnionAnalyticsRecord = {
        id: crypto.randomUUID(),
        reportId: resultPayload.reportId,
        timestamp: resultPayload.timestamp,
        procurementCentre: form.procurementCentre,
        onionVariety: form.onionVariety,
        totalOnions: summary.totalCount,
        gradeAPercent: summary.gradeAPercent,
        ursPercent: summary.ursPercent,
        rottenPercent: summary.rottenPercent,
        sproutedPercent: summary.sproutedPercent,
        damagedPercent: summary.damagedPercent,
        undersizedPercent: summary.undersizedCount > 0 ? Number(((summary.undersizedCount / summary.totalCount) * 100).toFixed(1)) : 0,
        overallStatus: summary.overallStatus,
      }

      const nextHistory = [analyticsEntry, ...history].slice(0, 30)
      setHistory(nextHistory)
      localStorage.setItem('rockstar-lens-onion-history', JSON.stringify(nextHistory))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // SIH Demo Mode Trigger
  const loadSihDemoSample = () => {
    // Generate a high quality demo specimen canvas image
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Background wooden crate pattern
      ctx.fillStyle = '#2d1b0e'
      ctx.fillRect(0, 0, 800, 600)

      // Draw grid lines
      ctx.strokeStyle = '#4a2e18'
      ctx.lineWidth = 2
      for (let x = 0; x < 800; x += 100) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke()
      }

      // Draw 8 sample onions with distinct visual properties
      const onions = [
        { x: 200, y: 170, r: 60, color: '#c2593f', label: 'Grade A Healthy' },
        { x: 440, y: 160, r: 52, color: '#b84e35', label: 'Grade A Healthy' },
        { x: 660, y: 185, r: 50, color: '#c55e42', label: 'Damaged (Skin Cut)' },
        { x: 180, y: 370, r: 54, color: '#b95237', label: 'Grade A Healthy' },
        { x: 420, y: 360, r: 48, color: '#aa472e', label: 'Sprouted Green Shoot' },
        { x: 650, y: 380, r: 35, color: '#9e3f28', label: 'Undersized (36mm)' },
        { x: 300, y: 510, r: 46, color: '#3d2b1f', label: 'Rotten Dark Patch' },
        { x: 550, y: 500, r: 58, color: '#bc543a', label: 'Grade A Healthy' },
      ]

      onions.forEach((o) => {
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = o.color
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = '#f5e6d3'
        ctx.stroke()

        // Inner tunic ring
        ctx.beginPath()
        ctx.arc(o.x - 5, o.y - 5, o.r * 0.7, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.stroke()

        // Green sprout highlight for sprouted onion
        if (o.label.includes('Sprouted')) {
          ctx.fillStyle = '#4ade80'
          ctx.beginPath()
          ctx.ellipse(o.x, o.y - o.r - 10, 8, 20, 0.2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Dark patch for rotten onion
        if (o.label.includes('Rotten')) {
          ctx.fillStyle = '#1e130c'
          ctx.beginPath()
          ctx.arc(o.x + 10, o.y + 10, 18, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const demoFile = new File([blob], 'SIH-26031-Demo-Specimen.jpg', { type: 'image/jpeg' })
          setFile(demoFile)
          setAnalysis(null)
          setError('')
        }
      }, 'image/jpeg')
    }
  }

  // Multilingual Speech Synthesis for Onion Summary
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeechStatus('STOPPED')
  }

  const speakOnionReport = () => {
    if (!analysis) return
    if (!('speechSynthesis' in window)) {
      setError('Voice report reader is not supported in this browser.')
      return
    }

    window.speechSynthesis.cancel()
    setSpeechStatus('READING')

    const summary = analysis.gradingSummary
    let voiceText = ''

    if (language === 'हिन्दी') {
      voiceText = `प्याज गुणवत्ता मूल्यांकन रिपोर्ट। कुल प्याज नमूनों की संख्या ${summary.totalCount} है। ग्रेड ए श्रेणी के प्याज ${summary.gradeAPercent} प्रतिशत हैं। यूआरएस द्वितीय श्रेणी के प्याज ${summary.ursPercent} प्रतिशत हैं। खराब प्याज ${summary.rottenPercent} प्रतिशत, अंकुरित प्याज ${summary.sproutedPercent} प्रतिशत, और छोटे प्याज ${summary.undersizedCount} हैं। समग्र गुणवत्ता स्थिति: ${summary.verdictMessage}`
    } else if (language === 'தமிழ்') {
      voiceText = `வெங்காய தர மதிப்பீட்டு அறிக்கை. மொத்த மாதிரி எண்ணிக்கை ${summary.totalCount}. கிரேடு ஏ வெங்காயம் ${summary.gradeAPercent} சதவீதம். URS இரண்டாம் நிலை வெங்காயம் ${summary.ursPercent} சதவீதம். சேதமடைந்த அல்லது அழுகிய வெங்காயம் ${summary.rottenPercent} சதவீதம்.`
    } else {
      voiceText = `Onion Quality Assessment Report. Your sample contains ${summary.totalCount} onions. ${summary.gradeAPercent} percent are classified as Grade A, ${summary.ursPercent} percent are classified under URS criteria. ${summary.damagedCount} show physical damage, ${summary.undersizedCount} are undersized, and ${summary.rottenCount} show signs of rot. Verdict: ${summary.verdictMessage}`
    }

    const utterance = new SpeechSynthesisUtterance(voiceText)
    utterance.lang = language === 'हिन्दी' ? 'hi-IN' : language === 'தமிழ்' ? 'ta-IN' : 'en-IN'

    utterance.onstart = () => setSpeechStatus('READING')
    utterance.onend = () => setSpeechStatus('READY')
    utterance.onerror = () => setSpeechStatus('STOPPED')

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="onion-module-container">
      {/* Module Banner Header */}
      <div className="sih-banner">
        <div className="sih-badge">
          <span>SIH PROBLEM STATEMENT 26031</span>
          <strong>Department of Consumer Affairs (DoCA)</strong>
        </div>
        <div className="sih-actions">
          <button className="sih-demo-btn" type="button" onClick={loadSihDemoSample}>
            ⚡ Load SIH Judge Demo Sample
          </button>
          <div className="onion-tab-group">
            <button
              className={activeTab === 'assessment' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('assessment')}
            >
              Assessment & Report
            </button>
            <button
              className={activeTab === 'history' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('history')}
            >
              Procurement History
            </button>
            <button
              className={activeTab === 'analytics' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('analytics')}
            >
              Analytics Dashboard
            </button>
            <button
              className={activeTab === 'settings' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('settings')}
            >
              Grading Rules
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'assessment' && (
        <>
          {/* Step 1: Mandatory Inspector Fields */}
          <section className="form-section-card">
            <div className="section-title">
              <span className="step-num">01</span>
              <div>
                <h3>Mandatory Procurement Sample Information</h3>
                <p>Required by Ministry of Consumer Affairs / NAFED prior to AI image analysis</p>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-field">
                <label>Procurement Centre *</label>
                <input
                  type="text"
                  value={form.procurementCentre}
                  onChange={(e) => handleInputChange('procurementCentre', e.target.value)}
                  placeholder="e.g. Lasalgaon Mandi Hub"
                />
              </div>

              <div className="form-field">
                <label>Sample ID *</label>
                <input
                  type="text"
                  value={form.sampleId}
                  onChange={(e) => handleInputChange('sampleId', e.target.value)}
                  placeholder="e.g. SAM-ONION-901"
                />
              </div>

              <div className="form-field">
                <label>Inspector Name / ID *</label>
                <input
                  type="text"
                  value={form.inspectorName}
                  onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                  placeholder="Inspector Name"
                />
              </div>

              <div className="form-field">
                <label>Date & Time *</label>
                <input
                  type="text"
                  value={form.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Onion Variety *</label>
                <select
                  value={form.onionVariety}
                  onChange={(e) => handleInputChange('onionVariety', e.target.value)}
                >
                  <option value="Nashik Red (Garwa)">Nashik Red (Garwa)</option>
                  <option value="Lasalgaon White">Lasalgaon White</option>
                  <option value="Kharif Onion (Unjha)">Kharif Onion (Unjha)</option>
                  <option value="Late Kharif (Pune Red)">Late Kharif (Pune Red)</option>
                  <option value="Rabi Harvest (Storage Grade)">Rabi Harvest (Storage Grade)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Sample Weight (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.sampleWeightKg}
                  onChange={(e) => handleInputChange('sampleWeightKg', Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Step 2: Image Upload & Preprocessing Validation */}
          <section className="upload-analysis-section">
            <div className="section-title">
              <span className="step-num">02</span>
              <div>
                <h3>Camera / Sample Image Upload</h3>
                <p>High-resolution front-facing sample tray image</p>
              </div>
            </div>

            <div className="upload-box-wrapper">
              <label className={`dropzone ${previewUrl ? 'has-file' : ''}`}>
                {previewUrl ? (
                  <div className="onion-preview-canvas-wrapper">
                    <img src={previewUrl} alt="Onion sample batch" className="sample-img" />

                    {/* Canvas Bounding Box Visualizer Overlay */}
                    {analysis && analysis.items.length > 0 && (
                      <div className="bbox-overlay-layer">
                        {analysis.items.map((item) => {
                          const boxColor =
                            item.condition === 'ROTTEN'
                              ? '#ef4444' // Red
                              : item.condition === 'SPROUTED'
                              ? '#eab308' // Yellow
                              : item.condition === 'DAMAGED'
                              ? '#f97316' // Orange
                              : item.sizeCategory === 'UNDERSIZED'
                              ? '#3b82f6' // Blue
                              : '#22c55e' // Green (Healthy)

                          const isSelected = selectedOnionId === item.id

                          return (
                            <div
                              key={item.id}
                              className={`bbox-rect ${isSelected ? 'selected' : ''}`}
                              style={{
                                top: `${item.boundingBox.ymin}%`,
                                left: `${item.boundingBox.xmin}%`,
                                width: `${item.boundingBox.xmax - item.boundingBox.xmin}%`,
                                height: `${item.boundingBox.ymax - item.boundingBox.ymin}%`,
                                borderColor: boxColor,
                              }}
                              onClick={() => setSelectedOnionId(item.id)}
                            >
                              <span className="bbox-tag" style={{ backgroundColor: boxColor }}>
                                {item.condition} ({Math.round(item.estimatedDiameterMm)}mm)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="dropzone-empty">
                    <span className="crosshair">◎</span>
                    <strong>Upload or Drop Onion Tray Image</strong>
                    <small>Supports JPG, PNG, WEBP — up to 15 MB</small>
                  </div>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectFile} />
              </label>

              {/* Pre-flight Image Quality Preprocessing Display */}
              {imageValidation && (
                <div className="image-quality-strip">
                  <div className="quality-metric">
                    <span>Sharpness Score:</span>
                    <strong>{imageValidation.sharpnessScore}/100</strong>
                    <small>{imageValidation.isBlurry ? '⚠ Blurry Image' : '✓ Good Focus'}</small>
                  </div>
                  <div className="quality-metric">
                    <span>Brightness Score:</span>
                    <strong>{imageValidation.brightnessScore}/100</strong>
                    <small>{imageValidation.isLightingPoor ? '⚠ Poor Lighting' : '✓ Good Illumination'}</small>
                  </div>
                  <div className="quality-metric">
                    <span>Validation Status:</span>
                    <strong className={imageValidation.isValid ? 'text-green' : 'text-amber'}>
                      {imageValidation.isValid ? 'READY FOR AI ANALYSIS' : 'REVIEW WARNINGS'}
                    </strong>
                  </div>
                </div>
              )}

              {imageValidation?.warnings && imageValidation.warnings.length > 0 && (
                <div className="warning-box">
                  {imageValidation.warnings.map((w) => (
                    <p key={w}>⚠ {w}</p>
                  ))}
                </div>
              )}

              <div className="action-buttons-row">
                <button
                  className="primary-button"
                  type="button"
                  disabled={!previewUrl || isAnalyzing}
                  onClick={runAnalysis}
                >
                  {isAnalyzing ? 'Analyzing Onion Quality...' : 'Run AI Quality Assessment'} <span>↗</span>
                </button>
                <button className="secondary-button" type="button" onClick={openCamera}>
                  ◎ <span>Live Camera Capture</span>
                </button>
              </div>

              {error && <p className="error-message">{error}</p>}
            </div>
          </section>

          {/* Step 3: Analysis Results & Grading Engine Summary */}
          {analysis && (
            <section className="results-panel">
              <div className="results-header">
                <div>
                  <span className="step-num">03</span>
                  <h2>Grading & Quality Summary</h2>
                  <p>
                    Report ID: {analysis.reportId} · Rules: {analysis.rulesVersion}
                  </p>
                </div>

                <div className="result-actions-group">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as any)
                      stopSpeech()
                    }}
                    className="lang-select-sm"
                  >
                    <option value="English">English</option>
                    <option value="हिन्दी">हिन्दी</option>
                    <option value="தமிழ்">தமிழ்</option>
                  </select>

                  <button className="voice-narrate-btn" type="button" onClick={speakOnionReport}>
                    ▶ Read Voice Report ({speechStatus})
                  </button>

                  {speechStatus === 'READING' && (
                    <button className="secondary-button" type="button" onClick={stopSpeech}>
                      ■ Stop
                    </button>
                  )}

                  <button
                    className="pdf-download-btn"
                    type="button"
                    onClick={() => generateOnionPdfReport(analysis, file)}
                  >
                    📄 Generate DoCA PDF Report
                  </button>
                </div>
              </div>

              {/* Status Verdict Header Banner */}
              <div className={`verdict-banner ${analysis.gradingSummary.overallStatus.toLowerCase()}`}>
                <div className="verdict-title">
                  <span>OVERALL BATCH VERDICT:</span>
                  <strong>{analysis.gradingSummary.overallStatus.replace(/_/g, ' ')}</strong>
                </div>
                <p>{analysis.gradingSummary.verdictMessage}</p>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="metrics-grid-4">
                <div className="metric-card grade-a">
                  <span>Grade A Yield</span>
                  <strong>{analysis.gradingSummary.gradeAPercent}%</strong>
                  <small>{analysis.gradingSummary.gradeACount} Onions</small>
                </div>

                <div className="metric-card urs">
                  <span>URS (Under-Size / Sec.)</span>
                  <strong>{analysis.gradingSummary.ursPercent}%</strong>
                  <small>{analysis.gradingSummary.ursCount} Onions</small>
                </div>

                <div className="metric-card defect">
                  <span>Defect / Rotten Rate</span>
                  <strong>{analysis.gradingSummary.rejectedPercent}%</strong>
                  <small>{analysis.gradingSummary.rottenCount} Rotten</small>
                </div>

                <div className="metric-card confidence">
                  <span>AI Confidence Score</span>
                  <strong>{Math.round(analysis.averageConfidence * 100)}%</strong>
                  <small>
                    {analysis.overallConfidenceLevel} ({analysis.lowConfidenceFlag ? 'Manual Review' : 'Verified'})
                  </small>
                </div>
              </div>

              {/* Detailed Categorical Inventory Table */}
              <div className="inventory-table-container">
                <h3>Detected Onion Item Breakdown ({analysis.items.length} Total Units)</h3>
                <p className="table-subtitle">Click any item row or bounding box to inspect individual defect evidence</p>

                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Condition</th>
                      <th>Size Category</th>
                      <th>Est. Diameter</th>
                      <th>Confidence</th>
                      <th>Grade Status</th>
                      <th>Defect Rationale / Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={selectedOnionId === item.id ? 'row-selected' : ''}
                        onClick={() => setSelectedOnionId(item.id)}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <span className={`badge-cond ${item.condition.toLowerCase()}`}>{item.condition}</span>
                        </td>
                        <td>{item.sizeCategory}</td>
                        <td>{Math.round(item.estimatedDiameterMm)} mm</td>
                        <td>
                          {Math.round(item.confidence * 100)}% ({item.confidenceLevel})
                        </td>
                        <td>
                          <span className={`badge-status ${item.qualityStatus.toLowerCase()}`}>
                            {item.qualityStatus}
                          </span>
                        </td>
                        <td className="reason-cell">{item.defectReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Findings & Recommended Actions */}
              <div className="findings-container">
                <div className="finding-col">
                  <h4>Key AI Findings</h4>
                  <ul>
                    {analysis.findings.map((f, i) => (
                      <li key={i}>→ {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="finding-col">
                  <h4>Recommended Inspector Actions</h4>
                  <ul>
                    {analysis.recommendedActions.map((a, i) => (
                      <li key={i}>→ {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <section className="history-tab-panel">
          <h2>Procurement Scan Archive</h2>
          <p>Local inspector database of prior onion quality assessments</p>

          {history.length === 0 ? (
            <p className="empty-msg">No saved onion assessments yet. Run your first assessment above.</p>
          ) : (
            <div className="history-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Timestamp</th>
                    <th>Procurement Centre</th>
                    <th>Variety</th>
                    <th>Total Count</th>
                    <th>Grade A %</th>
                    <th>URS %</th>
                    <th>Rotten %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.reportId}</td>
                      <td>{new Date(h.timestamp).toLocaleString()}</td>
                      <td>{h.procurementCentre}</td>
                      <td>{h.onionVariety}</td>
                      <td>{h.totalOnions}</td>
                      <td>
                        <strong>{h.gradeAPercent}%</strong>
                      </td>
                      <td>{h.ursPercent}%</td>
                      <td>{h.rottenPercent}%</td>
                      <td>
                        <span className={`badge-status ${h.overallStatus.toLowerCase()}`}>
                          {h.overallStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <section className="analytics-tab-panel">
          <h2>Procurement Analytics Dashboard</h2>
          <p>Aggregated statistics across analyzed onion procurement batches</p>

          {history.length === 0 ? (
            <p className="empty-msg">Run assessments to generate real-time procurement trends and metrics.</p>
          ) : (
            <div className="analytics-summary-cards">
              <div className="ana-card">
                <span>Total Batches Analyzed</span>
                <strong>{history.length}</strong>
              </div>
              <div className="ana-card">
                <span>Average Grade A Yield</span>
                <strong>
                  {Math.round(history.reduce((a, b) => a + b.gradeAPercent, 0) / history.length)}%
                </strong>
              </div>
              <div className="ana-card">
                <span>Average URS Rate</span>
                <strong>
                  {Math.round(history.reduce((a, b) => a + b.ursPercent, 0) / history.length)}%
                </strong>
              </div>
              <div className="ana-card">
                <span>Average Rotten Rate</span>
                <strong>
                  {Number((history.reduce((a, b) => a + b.rottenPercent, 0) / history.length).toFixed(1))}%
                </strong>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SETTINGS / GRADING RULES TAB */}
      {activeTab === 'settings' && (
        <section className="settings-tab-panel">
          <h2>Configurable Grading Engine Rules</h2>
          <p>Adjust procurement threshold criteria (DoCA / NAFED Official Parameter Matrix)</p>

          <div className="rules-form-grid">
            <div className="rule-field">
              <label>Grade A Minimum Diameter (mm)</label>
              <input
                type="number"
                value={rules.gradeAMinDiameterMm}
                onChange={(e) => setRules({ ...rules, gradeAMinDiameterMm: Number(e.target.value) })}
              />
              <small>Onions below this threshold are categorized as Undersized (URS)</small>
            </div>

            <div className="rule-field">
              <label>Maximum Allowed Defect Percent for Grade A (%)</label>
              <input
                type="number"
                step="0.5"
                value={rules.gradeAMaxDefectPercent}
                onChange={(e) => setRules({ ...rules, gradeAMaxDefectPercent: Number(e.target.value) })}
              />
            </div>

            <div className="rule-field">
              <label>Maximum Allowed Rotten Percent for URS (%)</label>
              <input
                type="number"
                step="0.5"
                value={rules.ursMaxRottenPercent}
                onChange={(e) => setRules({ ...rules, ursMaxRottenPercent: Number(e.target.value) })}
              />
              <small>Batches exceeding this rot limit are automatically rejected</small>
            </div>

            <div className="rule-field">
              <label>Maximum Allowed Sprouted Percent for URS (%)</label>
              <input
                type="number"
                step="0.5"
                value={rules.ursMaxSproutedPercent}
                onChange={(e) => setRules({ ...rules, ursMaxSproutedPercent: Number(e.target.value) })}
              />
            </div>
          </div>
        </section>
      )}

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true">
          <div className="camera-window">
            <button className="close-button" type="button" onClick={closeCamera}>
              ×
            </button>
            <p className="kicker">Live Onion Camera Inspector</p>
            <h2>Frame the Onion Sample Tray</h2>
            <div className="video-frame">
              {cameraError ? <p>{cameraError}</p> : <video ref={videoRef} autoPlay playsInline muted />}
            </div>
            <button className="primary-button" type="button" onClick={capturePhoto}>
              Capture Sample Tray <span>◎</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
