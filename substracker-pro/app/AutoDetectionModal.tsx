'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, CheckCircle, AlertCircle, Loader2, Eye, Shield, TrendingUp, Mail, Plus } from 'lucide-react'
import { autoDetectionService, DetectedSubscription } from './AutoDetectionService'
import { authService, EmailAccount } from './AuthService'
import { Subscription } from './types'

interface AutoDetectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSubscriptions: (subscriptions: Omit<Subscription, 'id'>[]) => void
}

export default function AutoDetectionModal({ isOpen, onClose, onAddSubscriptions }: AutoDetectionModalProps) {
  const [currentStep, setCurrentStep] = useState<'methods' | 'email-select' | 'connecting' | 'detecting' | 'results'>('methods')
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([])
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(autoDetectionService.getConnectionStatus())
  const [userEmails, setUserEmails] = useState<EmailAccount[]>([])
  const [newEmailForm, setNewEmailForm] = useState({ email: '', provider: 'gmail' as 'gmail' | 'outlook' | 'yahoo' | 'other' })
  const [showAddEmail, setShowAddEmail] = useState(false)

  const methods = autoDetectionService.getAvailableMethods()

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('methods')
      setSelectedMethods([])
      setSelectedEmails([])
      setDetectedSubscriptions([])
      setSelectedSubscriptions([])
      setConnectionStatus(autoDetectionService.getConnectionStatus())
      setUserEmails(authService.getConnectedEmails())
      setShowAddEmail(false)
    }
  }, [isOpen])

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    )
  }

  const handleMethodsNext = () => {
    if (selectedMethods.length === 0) return
    
    // If email scanning is selected, show email selection
    if (selectedMethods.includes('email_receipts')) {
      setCurrentStep('email-select')
    } else {
      handleStartDetection()
    }
  }

  const handleStartDetection = async () => {
    setIsLoading(true)
    setCurrentStep('connecting')
    
    try {
      let allDetected: DetectedSubscription[] = []
      
      // Handle bank connection
      if (selectedMethods.includes('bank_transactions')) {
        if (!connectionStatus.isConnected) {
          const result = await autoDetectionService.connectToBank()
          if (!result.success) {
            throw new Error(result.message)
          }
          setConnectionStatus(autoDetectionService.getConnectionStatus())
        }
        
        setCurrentStep('detecting')
        const bankDetected = await autoDetectionService.detectSubscriptions()
        allDetected = [...allDetected, ...bankDetected]
      }
      
      // Handle email scanning
      if (selectedMethods.includes('email_receipts') && selectedEmails.length > 0) {
        setCurrentStep('detecting')
        
        // Scan each selected email account
        for (const emailId of selectedEmails) {
          const result = await authService.scanEmailAccount(emailId)
          if (result.success && result.subscriptions) {
            const emailDetected: DetectedSubscription[] = result.subscriptions.map(sub => ({
              source: 'email_receipt' as const,
              confidence: 85 + Math.floor(Math.random() * 10),
              suggestedSubscription: sub,
              rawData: {
                emailId,
                provider: userEmails.find(e => e.id === emailId)?.provider || 'unknown',
                scanDate: new Date().toISOString(),
                receiptData: sub
              }
            }))
            allDetected = [...allDetected, ...emailDetected]
          }
        }
      }
      
      setDetectedSubscriptions(allDetected)
      setSelectedSubscriptions(allDetected.map((_, index) => index.toString()))
      setCurrentStep('results')
    } catch (error) {
      console.error('Detection failed:', error)
      // Handle error state
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailToggle = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const handleAddEmail = async () => {
    if (!newEmailForm.email) return
    
    const result = await authService.addEmailAccount(newEmailForm.email, newEmailForm.provider)
    if (result.success) {
      setUserEmails(authService.getConnectedEmails())
      setNewEmailForm({ email: '', provider: 'gmail' })
      setShowAddEmail(false)
    }
  }

  const handleSubscriptionToggle = (index: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(index)
        ? prev.filter(id => id !== index)
        : [...prev, index]
    )
  }

  const handleAddSelected = () => {
    const subscriptionsToAdd = selectedSubscriptions.map(index => 
      detectedSubscriptions[parseInt(index)].suggestedSubscription
    )
    onAddSubscriptions(subscriptionsToAdd)
    onClose()
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'connecting': return <Loader2 className="w-6 h-6 animate-spin" />
      case 'detecting': return <Eye className="w-6 h-6" />
      case 'results': return <CheckCircle className="w-6 h-6" />
      default: return <Zap className="w-6 h-6" />
    }
  }

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'connecting': return 'Connecting Securely...'
      case 'detecting': return 'Detecting Subscriptions...'
      case 'results': return 'Found Subscriptions'
      default: return 'Automatic Detection'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-primary opacity-10 rounded-full blur-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-secondary opacity-10 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-primary rounded-xl">
                      {getStepIcon(currentStep)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{getStepTitle(currentStep)}</h2>
                      <p className="text-sm text-white/60">Discover your subscriptions automatically</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Methods Selection */}
                {currentStep === 'methods' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-lg font-semibold text-white mb-2">Choose Detection Methods</h3>
                      <p className="text-white/60">Select how you'd like to automatically detect your subscriptions</p>
                    </div>

                    <div className="space-y-4">
                      {methods.map((method) => (
                        <motion.div
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                            method.status === 'coming_soon'
                              ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                              : selectedMethods.includes(method.id)
                              ? 'bg-cyan-500/10 border-cyan-500/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                          onClick={() => method.status !== 'coming_soon' && handleMethodToggle(method.id)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="text-3xl">{method.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{method.name}</h4>
                                <div className="flex items-center space-x-2">
                                  {method.status === 'connected' && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                      Connected
                                    </span>
                                  )}
                                  {method.status === 'coming_soon' && (
                                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                                      Coming Soon
                                    </span>
                                  )}
                                  {selectedMethods.includes(method.id) && (
                                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                                  )}
                                </div>
                              </div>
                              <p className="text-white/60 text-sm mb-3">{method.description}</p>
                              <div className="flex items-center space-x-4 text-xs">
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                                  <span className="text-white/60">Accuracy: {method.accuracy}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Shield className="w-3 h-3 text-green-400" />
                                  <span className="text-white/60">{method.privacy}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ 
                          scale: selectedMethods.length > 0 ? 1.02 : 1, 
                          boxShadow: selectedMethods.length > 0 ? "0 0 30px rgba(0, 255, 255, 0.3)" : "none"
                        }}
                        whileTap={{ scale: selectedMethods.length > 0 ? 0.98 : 1 }}
                        onClick={handleMethodsNext}
                        disabled={selectedMethods.length === 0 || isLoading}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all shadow-lg ${
                          selectedMethods.length > 0 && !isLoading
                            ? 'bg-gradient-primary text-white hover:shadow-cyan-500/25 neon-glow'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                        {selectedMethods.includes('email_receipts') ? 'Next: Select Emails' : 'Start Detection'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Email Selection */}
                {currentStep === 'email-select' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Select Email Accounts</h3>
                      <p className="text-white/60">Choose which email accounts to scan for subscription receipts</p>
                    </div>

                    <div className="space-y-4">
                      {userEmails.map((email) => (
                        <motion.div
                          key={email.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                            selectedEmails.includes(email.id)
                              ? 'bg-cyan-500/10 border-cyan-500/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleEmailToggle(email.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{email.email}</h4>
                                <div className="flex items-center space-x-2 text-sm text-white/60">
                                  <span className="capitalize">{email.provider}</span>
                                  {email.subscriptionCount && (
                                    <>
                                      <span>•</span>
                                      <span>{email.subscriptionCount} subscriptions found</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedEmails.includes(email.id) && (
                              <CheckCircle className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* Add Email Account */}
                      {!showAddEmail ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowAddEmail(true)}
                          className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all duration-300"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" />
                            <span>Add Another Email Account</span>
                          </div>
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">Add Email Account</h4>
                            <button
                              onClick={() => setShowAddEmail(false)}
                              className="text-white/40 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="email"
                              placeholder="Email address"
                              value={newEmailForm.email}
                              onChange={(e) => setNewEmailForm({ ...newEmailForm, email: e.target.value })}
                              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-white/40"
                            />
                            <select
                              value={newEmailForm.provider}
                              onChange={(e) => setNewEmailForm({ ...newEmailForm, provider: e.target.value as any })}
                              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                            >
                              <option value="gmail">Gmail</option>
                              <option value="outlook">Outlook</option>
                              <option value="yahoo">Yahoo</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddEmail}
                            disabled={!newEmailForm.email}
                            className="w-full px-4 py-3 bg-gradient-primary text-white rounded-xl transition-all disabled:opacity-50"
                          >
                            Add Email Account
                          </motion.button>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep(selectedMethods.includes('email_receipts') ? 'email-select' : 'methods')}
                        className="flex-1 px-6 py-4 text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ 
                          scale: selectedEmails.length > 0 ? 1.02 : 1, 
                          boxShadow: selectedEmails.length > 0 ? "0 0 30px rgba(0, 255, 255, 0.3)" : "none"
                        }}
                        whileTap={{ scale: selectedEmails.length > 0 ? 0.98 : 1 }}
                        onClick={handleStartDetection}
                        disabled={selectedEmails.length === 0}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all shadow-lg ${
                          selectedEmails.length > 0
                            ? 'bg-gradient-primary text-white hover:shadow-cyan-500/25 neon-glow'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                        Start Scanning {selectedEmails.length} Email{selectedEmails.length !== 1 ? 's' : ''}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Loading States */}
                {(currentStep === 'connecting' || currentStep === 'detecting') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="mb-6">
                      <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {currentStep === 'connecting' ? 'Connecting Securely...' : 'Analyzing Your Data...'}
                      </h3>
                      <p className="text-white/60">
                        {currentStep === 'connecting' 
                          ? 'Establishing secure connection to your financial data'
                          : 'Scanning for subscription patterns and recurring payments'
                        }
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-white/40">
                      <Shield className="w-4 h-4" />
                      <span>Bank-level security • No sensitive data stored</span>
                    </div>
                  </motion.div>
                )}

                {/* Results */}
                {currentStep === 'results' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Found {detectedSubscriptions.length} Subscription{detectedSubscriptions.length !== 1 ? 's' : ''}
                      </h3>
                      <p className="text-white/60">Review and select which subscriptions to add to your tracker</p>
                    </div>

                    {detectedSubscriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                        <h4 className="text-white font-medium mb-2">No Subscriptions Detected</h4>
                        <p className="text-white/60 text-sm">We couldn't find any subscription patterns in your selected data sources.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {detectedSubscriptions.map((detected, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                              selectedSubscriptions.includes(index.toString())
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                            onClick={() => handleSubscriptionToggle(index.toString())}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                {detected.suggestedSubscription.logo ? (
                                  <img 
                                    src={detected.suggestedSubscription.logo} 
                                    alt={detected.suggestedSubscription.name} 
                                    className="w-8 h-8 object-contain"
                                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-white">
                                    {detected.suggestedSubscription.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-white">{detected.suggestedSubscription.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">
                                      {detected.confidence}% confidence
                                    </span>
                                    {selectedSubscriptions.includes(index.toString()) && (
                                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-white/60">
                                  <span>${detected.suggestedSubscription.price}/{detected.suggestedSubscription.billingCycle}</span>
                                  <span>•</span>
                                  <span>{detected.suggestedSubscription.category}</span>
                                  <span>•</span>
                                  <span className="capitalize">{detected.source.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('methods')}
                        className="flex-1 px-6 py-4 text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ 
                          scale: selectedSubscriptions.length > 0 ? 1.02 : 1, 
                          boxShadow: selectedSubscriptions.length > 0 ? "0 0 30px rgba(0, 255, 255, 0.3)" : "none"
                        }}
                        whileTap={{ scale: selectedSubscriptions.length > 0 ? 0.98 : 1 }}
                        onClick={handleAddSelected}
                        disabled={selectedSubscriptions.length === 0}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all shadow-lg ${
                          selectedSubscriptions.length > 0
                            ? 'bg-gradient-primary text-white hover:shadow-cyan-500/25 neon-glow'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Add {selectedSubscriptions.length} Subscription{selectedSubscriptions.length !== 1 ? 's' : ''}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}