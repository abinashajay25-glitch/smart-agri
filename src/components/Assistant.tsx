import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Mic,
  Volume2,
  Languages,
  Sparkles,
  User,
  Loader2,
  VolumeX,
  RotateCcw,
  Info
} from 'lucide-react'
import { ChatMessage, UserProfile } from '../types'

interface AssistantProps {
  user: UserProfile
  language: 'en' | 'ta'
  setLanguage: (lang: 'en' | 'ta') => void
}

export const Assistant: React.FC<AssistantProps> = ({
  user,
  language,
  setLanguage,
}) => {
  const isTa = language === 'ta'

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: isTa
        ? `வணக்கம் ${user.name}! நான் SmartAgri AI விவசாய ஆலோசகர். தக்காளி, வெங்காயம், மிளகாய் பயிர்களின் அறுவடைக்குப் பின் மேலாண்மை, சேமிப்புக் கிடங்கு பராமரிப்பு, மற்றும் சந்தை விலை நிலவரம் பற்றி நீங்கள் கேட்கலாம்.`
        : `Vanakkam ${user.name}! I am SmartAgri Mitra, your AI post-harvest and market advisor. How can I help you protect your crop inventory or optimize mandi sales today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    }

    setMessages((prev) => [...prev, userMsg])
    const promptText = input
    setInput('')
    setLoading(true)
    setAudioError(null)

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          language,
          history: messages.slice(-5),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        throw new Error('Server returned error')
      }
    } catch {
      // Natural fallback
      const fallbackReply = isTa
        ? `தக்காளி மற்றும் வெங்காய அறுவடைக்குப் பின் இழப்புகளைத் தவிர்க்க, காற்றோட்டமான பிளாஸ்டிக் பெட்டிகளைப் பயன்படுத்துங்கள். அதிக வெப்பநிலை இருந்தால் நிழல் வலைகளில் வைக்கவும்.`
        : `To prevent post-harvest shrinkage and fungal breakdown in tomatoes and onions, maintain proper aeration, keep produce in sanitized crates, and liquidate batches showing early softness within 48 hours.`

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  // ElevenLabs Text-to-Speech Playback with markdown formatting stripped
  const playSpeech = async (text: string) => {
    // Strip markdown asterisks (**bold**, *italic*) and bullet symbols so voice speech sounds natural
    const cleanSpeechText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .trim()

    if (isPlayingAudio) {
      audioPlayerRef.current?.pause()
      setIsPlayingAudio(false)
      return
    }

    try {
      setIsPlayingAudio(true)
      setAudioError(null)

      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeechText, language }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        audioPlayerRef.current = audio

        audio.onended = () => {
          setIsPlayingAudio(false)
        }
        audio.onerror = () => {
          setIsPlayingAudio(false)
          setAudioError('Audio playback failed.')
        }

        await audio.play()
      } else {
        // Fallback to browser SpeechSynthesis if backend speech unavailable
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanSpeechText.slice(0, 300))
          utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
          utterance.onend = () => setIsPlayingAudio(false)
          window.speechSynthesis.speak(utterance)
        } else {
          setAudioError('Voice generation is unavailable.')
          setIsPlayingAudio(false)
        }
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanSpeechText.slice(0, 300))
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
        utterance.onend = () => setIsPlayingAudio(false)
        window.speechSynthesis.speak(utterance)
      } else {
        setIsPlayingAudio(false)
      }
    }
  }

  const quickPrompts = isTa
    ? [
        'தக்காளி அழுகுவதை தடுப்பது எப்படி?',
        'நாசிக் வெங்காய சேமிப்பு சிறந்த நடைமுறைகள்',
        'கோயம்பேடு தக்காளி விலை நிலவரம் என்ன?',
        'பச்சை மிளகாய் அடுக்கு ஆயுளை நீட்டிக்க வழிகள்',
      ]
    : [
        'How to prevent tomato fungal rot after harvest?',
        'Best storage temperature for Nashik onions',
        'Compare Koyambedu vs Dindigul tomato prices',
        'How to extend green chilli shelf life in summer?',
      ]

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Top Title Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-emerald-950 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              SmartAgri Mitra (விவசாய உதவியாளர்)
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                ElevenLabs Voice Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {isTa ? 'தமிழ் மற்றும் ஆங்கிலத்தில் பேசும் AI வேளாண் வழிகாட்டி' : 'Bilingual agronomist & mandi strategist with speech feedback'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(isTa ? 'en' : 'ta')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Languages className="w-4 h-4 text-emerald-700" />
          {isTa ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-lime-300 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-emerald-800 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 opacity-70">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => playSpeech(msg.text)}
                      className="hover:opacity-100 flex items-center gap-1 font-bold text-emerald-700 ml-4"
                      title="Listen with ElevenLabs AI Voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isPlayingAudio ? 'Playing...' : 'Voice'}
                    </button>
                  )}
                </div>
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>SmartAgri Mitra is analyzing agricultural guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q)
            }}
            className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isTa
              ? 'பயிர் பாதுகாப்பு அல்லது சந்தை விலை பற்றி தமிழில் கேட்கவும்...'
              : 'Ask post-harvest question in English or Tamil...'
          }
          className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
        >
          <Send className="w-4 h-4 text-lime-400" />
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}
