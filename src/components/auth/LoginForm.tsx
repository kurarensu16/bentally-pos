import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center px-10 space-y-10">
          <div>
            <div className="flex items-center text-sm uppercase tracking-[0.4em] text-white/70 space-x-3">
              <div className="w-10 h-[1px] bg-white/50" />
              <span>Restaurant SaaS</span>
            </div>
            <h1 className="mt-6 text-4xl xl:text-5xl font-semibold leading-tight">
              Run payments, tables, and orders in one elegant POS.
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl">
              Accept cash, cards, and e-wallets in seconds while staying on top of daily operations.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <div className="text-center mb-8">
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Access your Bentally POS dashboard</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="you@restaurant.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Create one for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}