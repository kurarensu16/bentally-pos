import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const { register, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!businessName.trim()) {
      setError('Please enter your restaurant name')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      const message = 'Please enter a valid email address'
      setError(message)
      alert(message)
      return
    }
    
    try {
      await register({ 
        email, 
        password, 
        name,
        businessName: businessName.trim()
      })
      setSuccessMessage('Check your email to confirm your sign up.')
      setError('')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary-500/15 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center px-10 space-y-10">
          <div>
            <div className="flex items-center text-sm uppercase tracking-[0.4em] text-white/70 space-x-3">
              <div className="w-10 h-[1px] bg-white/50" />
              <span>Grow with Bentally</span>
            </div>
            <h1 className="mt-6 text-4xl xl:text-5xl font-semibold leading-tight">
              Launch your POS, online ordering, and payments in minutes.
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl">
              Build a modern restaurant brand with enterprise-grade tools tailored for Philippine businesses.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-slate-900">Create your account</h2>
              <p className="mt-2 text-sm text-slate-500">No credit card required</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm">
                {successMessage}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div>
              <label htmlFor="businessName" className="block text-xs font-semibold.uppercase tracking-wide text-slate-500 mb-2">
                Restaurant/Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500.focus:border-transparent transition-all"
                placeholder="e.g., Mang Chooks"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Email address
              </label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50.disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
              
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

