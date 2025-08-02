'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, User, Eye, EyeOff, Chrome, Code, 
  Sparkles, Shield, Zap, ArrowRight, CheckCircle,
  AlertCircle, Loader2
} from 'lucide-react'
import { authService, AuthState } from './AuthService'

interface LoginPageProps {
  onAuthSuccess: () => void
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'developer'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    developerEmail: ''
  })
  const [authState, setAuthState] = useState<AuthState>(authService.getState())
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (authState.isAuthenticated) {
      onAuthSuccess()
    }
  }, [authState.isAuthenticated, onAuthSuccess])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDeveloperLogin = async () => {
    const result = await authService.loginDeveloperMode(formData.developerEmail || undefined)
    if (result.success) {
      showNotification('success', 'Developer mode activated!')
    } else {
      showNotification('error', result.message || 'Developer login failed')
    }
  }

  const handleGoogleLogin = async () => {
    const result = await authService.loginWithGoogle()
    if (result.success) {
      showNotification('success', 'Successfully logged in with Google!')
    } else {
      showNotification('error', result.message || 'Google login failed')
    }
  }

  const handleEmailLogin = async () => {
    if (!formData.email || !formData.password) {
      showNotification('error', 'Please fill in all fields')
      return
    }
    
    const result = await authService.loginWithEmail(formData.email, formData.password)
    if (result.success) {
      showNotification('success', 'Successfully logged in!')
    } else {
      showNotification('error', result.message || 'Login failed')
    }
  }

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      showNotification('error', 'Please fill in all fields')
      return
    }
    
    const result = await authService.signUp(formData.email, formData.password, formData.name)
    if (result.success) {
      showNotification('success', 'Account created successfully!')
    } else {
      showNotification('error', result.message || 'Sign up failed')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      handleEmailLogin()
    } else if (mode === 'signup') {
      handleSignUp()
    } else {
      handleDeveloperLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-md border"
            style={{
              backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card rounded-3xl p-8 w-full max-w-md relative z-10 border border-white/20"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60">Access your subscription dashboard</p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {[
            { key: 'login', label: 'Login', icon: Mail },
            { key: 'signup', label: 'Sign Up', icon: User },
            { key: 'developer', label: 'Dev Mode', icon: Code }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                mode === key
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Developer Mode */}
        {mode === 'developer' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-cyan-400">Developer Mode</h3>
              </div>
              <p className="text-white/60 text-sm mb-4">
                Skip authentication for testing. Your email data is completely secure and mocked.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Test Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="developerEmail"
                    value={formData.developerEmail}
                    onChange={handleInputChange}
                    placeholder="developer@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeveloperLogin}
                  disabled={authState.isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-primary text-white rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 neon-glow disabled:opacity-50"
                >
                  {authState.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Enter Developer Mode</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login/Signup Forms */}
        {(mode === 'login' || mode === 'signup') && (
          <motion.form
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Google Login Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={authState.isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-xl transition-all shadow-lg hover:shadow-lg disabled:opacity-50 font-medium"
            >
              {authState.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-white/60">or continue with email</span>
              </div>
            </div>

            {/* Name field for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              disabled={authState.isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-primary text-white rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 neon-glow disabled:opacity-50"
            >
              {authState.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-green-400">Secure & Private</h4>
          </div>
          <p className="text-white/60 text-sm">
            Your email credentials are encrypted and never stored. We only access subscription-related emails with your explicit permission.
          </p>
        </div>

        {/* Error display */}
        {authState.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{authState.error}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}