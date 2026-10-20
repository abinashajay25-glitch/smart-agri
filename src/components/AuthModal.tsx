import React, { useState } from 'react'
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Leaf
} from 'lucide-react'
import { DEFAULT_USER } from '../mockAgriData'
import { UserProfile } from '../types'

interface AuthProps {
  onLoginSuccess: (user: UserProfile) => void
  onExploreDemo: () => void
  language: 'en' | 'ta'
}

export const AuthModal: React.FC<AuthProps> = ({
  onLoginSuccess,
  onExploreDemo,
  language,
}) => {
  const isTa = language === 'ta'
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('farmer@smartagri.org')
  const [password, setPassword] = useState('kisan123')
  const [name, setName] = useState('Ramesh Patel')
  const [phone, setPhone] = useState('+91 98421 78940')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLoginSuccess({
      ...DEFAULT_USER,
      name: isSignUp ? name : DEFAULT_USER.name,
      email: email || DEFAULT_USER.email,
      phone: isSignUp ? phone : DEFAULT_USER.phone,
    })
  }

  const fillQuickDemo = () => {
    onLoginSuccess(DEFAULT_USER)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200/80 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-700 flex items-center justify-center text-white mx-auto shadow-md">
            <Leaf className="w-7 h-7 text-emerald-950" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create Farmer Account' : 'Welcome to SmartAgri AI'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isTa ? 'உங்கள் பண்ணை இருப்பு மற்றும் விற்பனை டாஷ்போர்டு' : 'Grow Smart • Store Safe • Sell Better'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Farmer Name"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone (+91)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Farmer Email / ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@smartagri.org"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <span>{isSignUp ? 'Create Farmer Account' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4 text-lime-400" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Or quick demo
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          onClick={fillQuickDemo}
          className="w-full py-2.5 bg-lime-50 hover:bg-lime-100 border border-lime-300 text-emerald-900 font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Launch 1-Click Verified Farmer Demo</span>
        </button>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New Farmer? Register your farm here'}
          </button>
        </div>
      </div>
    </div>
  )
}
