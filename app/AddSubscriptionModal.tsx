'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, DollarSign, Tag, Globe, Sparkles, Zap } from 'lucide-react'
import { Subscription } from './types'

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (subscription: Omit<Subscription, 'id'>) => void
}

const categories = [
  'Streaming',
  'Music',
  'Productivity',
  'Design',
  'Development',
  'Gaming',
  'News',
  'Fitness',
  'Education',
  'Other'
]

const billingCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' }
]

const popularServices = [
  {
    name: 'Spotify',
    price: 9.99,
    category: 'Music',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/spotify.svg',
    website: 'https://spotify.com',
    color: '#1DB954'
  },
  {
    name: 'Netflix',
    price: 15.49,
    category: 'Streaming',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg',
    website: 'https://netflix.com',
    color: '#E50914'
  },
  {
    name: 'YouTube Premium',
    price: 11.99,
    category: 'Streaming',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/youtube.svg',
    website: 'https://youtube.com',
    color: '#FF0000'
  },
  {
    name: 'Adobe Creative Cloud',
    price: 52.99,
    category: 'Design',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/adobe.svg',
    website: 'https://adobe.com',
    color: '#FF0000'
  },
  {
    name: 'GitHub Pro',
    price: 4.00,
    category: 'Development',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/github.svg',
    website: 'https://github.com',
    color: '#181717'
  },
  {
    name: 'Figma',
    price: 12.00,
    category: 'Design',
    billingCycle: 'monthly',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/figma.svg',
    website: 'https://figma.com',
    color: '#F24E1E'
  }
]

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Streaming',
    billingCycle: 'monthly',
    nextBilling: '',
    logo: '',
    website: '',
    color: ''
  })
  const [showPopularServices, setShowPopularServices] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.nextBilling) return

    onAdd({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      billingCycle: formData.billingCycle as 'monthly' | 'yearly',
      nextBilling: formData.nextBilling,
      logo: formData.logo,
      website: formData.website,
      color: formData.color
    })

    setFormData({
      name: '',
      price: '',
      category: 'Streaming',
      billingCycle: 'monthly',
      nextBilling: '',
      logo: '',
      website: '',
      color: ''
    })
    onClose()
  }

  const handlePopularServiceSelect = (service: typeof popularServices[0]) => {
    // Calculate next billing date (30 days from now for monthly)
    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 30)
    
    setFormData({
      name: service.name,
      price: service.price.toString(),
      category: service.category,
      billingCycle: service.billingCycle,
      nextBilling: nextBilling.toISOString().split('T')[0],
      logo: service.logo,
      website: service.website,
      color: service.color
    })
    setShowPopularServices(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <div className="glass-card rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-primary opacity-10 rounded-full blur-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-secondary opacity-10 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-primary rounded-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Add New Service</h2>
                      <p className="text-sm text-white/60">Expand your subscription portfolio</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {showPopularServices && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Popular Services</h3>
                        <button
                          type="button"
                          onClick={() => setShowPopularServices(false)}
                          className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {popularServices.map((service) => (
                          <motion.button
                            key={service.name}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePopularServiceSelect(service)}
                            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-left group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <span className="text-lg font-bold text-white">
                                  {service.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-white text-sm">{service.name}</div>
                                <div className="text-xs text-white/60">${service.price}/{service.billingCycle}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowPopularServices(false)}
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          + Add custom service instead
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                      placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                        Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                          placeholder="9.99"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                        Billing Cycle
                      </label>
                      <select
                        value={formData.billingCycle}
                        onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none cursor-pointer text-white"
                      >
                        {billingCycles.map(cycle => (
                          <option key={cycle.value} value={cycle.value} className="bg-gray-800">
                            {cycle.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                      Category
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none cursor-pointer text-white"
                      >
                        {categories.map(category => (
                          <option key={category} value={category} className="bg-gray-800">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                      Next Billing Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.nextBilling}
                        onChange={(e) => handleInputChange('nextBilling', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                        Logo URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => handleInputChange('logo', e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">
                        Website URL (optional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
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
                        scale: 1.02, 
                        boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-primary text-white rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 neon-glow"
                    >
                      <Zap className="w-5 h-5" />
                      Add Service
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}