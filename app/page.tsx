'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Search, Filter, DollarSign, Calendar, TrendingUp, 
  AlertTriangle, Zap, Target, BarChart3, Globe, 
  Sparkles, Activity, Clock, Wallet, Bot
} from 'lucide-react'
import SubscriptionCard from './SubscriptionCard.tsx'
import AddSubscriptionModal from './AddSubscriptionModal.tsx'
import AutoDetectionModal from './AutoDetectionModal.tsx'
import StatsCard from './StatsCard.tsx'
import { Subscription } from './types'

// Load subscriptions from localStorage or start with empty array
const loadSubscriptions = (): Subscription[] => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('subscriptions')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Save subscriptions to localStorage
const saveSubscriptions = (subscriptions: Subscription[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
  }
}

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  
  // Load subscriptions on component mount
  useEffect(() => {
    setSubscriptions(loadSubscriptions())
  }, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAutoDetectionOpen, setIsAutoDetectionOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = ['All', ...new Set(subscriptions.map(sub => sub.category))]
  
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Enhanced Analytics
  const analytics = useMemo(() => {
    const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0)
    const totalYearly = totalMonthly * 12
    const activeSubscriptions = subscriptions.length
    
    // Calculate days until next billing for warnings
    const subscriptionsWithDays = subscriptions.map(sub => {
      const nextBilling = new Date(sub.nextBilling)
      const today = new Date()
      const diffTime = nextBilling.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return { ...sub, daysUntilBilling: diffDays }
    })
    
    const upcomingBilling = subscriptionsWithDays.filter(sub => sub.daysUntilBilling <= 7 && sub.daysUntilBilling > 0)
    const overdueBilling = subscriptionsWithDays.filter(sub => sub.daysUntilBilling < 0)
    
    // Category breakdown
    const categorySpending = categories.slice(1).map(category => {
      const categoryTotal = subscriptions
        .filter(sub => sub.category === category)
        .reduce((sum, sub) => sum + sub.price, 0)
      return { category, amount: categoryTotal }
    }).sort((a, b) => b.amount - a.amount)
    
    // Most expensive subscription
    const mostExpensive = subscriptions.reduce((max, sub) => 
      sub.price > max.price ? sub : max, subscriptions[0])
    
    // Average subscription cost
    const averageCost = totalMonthly / activeSubscriptions
    
    return {
      totalMonthly,
      totalYearly,
      activeSubscriptions,
      upcomingBilling,
      overdueBilling,
      categorySpending,
      mostExpensive,
      averageCost
    }
  }, [subscriptions, categories])

  const addSubscription = (newSubscription: Omit<Subscription, 'id'>) => {
    const billingCycle = newSubscription.billingCycle
    const subscription: Subscription = {
      ...newSubscription,
      id: Date.now().toString(),
      website: newSubscription.website || '',
      color: newSubscription.color || '#6366F1',
      billingCycle: (billingCycle === 'monthly' || billingCycle === 'yearly') ? billingCycle : 'monthly'
    }
    const updatedSubscriptions = [...subscriptions, subscription]
    setSubscriptions(updatedSubscriptions)
    saveSubscriptions(updatedSubscriptions)
  }

  const addMultipleSubscriptions = (newSubscriptions: Omit<Subscription, 'id'>[]) => {
    const subscriptionsWithIds = newSubscriptions.map((sub, index) => ({
      ...sub,
      id: (Date.now() + index).toString(),
      website: sub.website || '',
      color: sub.color || '#6366F1',
      billingCycle: (sub.billingCycle === 'monthly' || sub.billingCycle === 'yearly') ? sub.billingCycle : 'monthly'
    }))
    const updatedSubscriptions = [...subscriptions, ...subscriptionsWithIds]
    setSubscriptions(updatedSubscriptions)
    saveSubscriptions(updatedSubscriptions)
  }

  const deleteSubscription = (id: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id)
    setSubscriptions(updatedSubscriptions)
    saveSubscriptions(updatedSubscriptions)
  }

  const openWebsite = (subscription: any) => {
    const domain = subscription.name.toLowerCase().replace(/\s+/g, '')
    let url = `https://${domain}.com`
    
    // Special cases for known services
    const urlMap: { [key: string]: string } = {
      'disney+': 'https://disneyplus.com',
      'hbo max': 'https://hbomax.com',
      'amazon prime video': 'https://primevideo.com',
      'apple tv+': 'https://tv.apple.com',
      'paramount+': 'https://paramountplus.com',
      'peacock premium': 'https://peacocktv.com',
      'spotify premium': 'https://spotify.com',
      'apple music': 'https://music.apple.com',
      'youtube premium': 'https://youtube.com/premium',
      'xbox game pass': 'https://xbox.com/game-pass',
      'playstation plus': 'https://playstation.com/plus',
      'adobe creative cloud': 'https://adobe.com/creativecloud',
      'figma pro': 'https://figma.com',
      'notion pro': 'https://notion.so',
      'microsoft 365': 'https://microsoft.com/microsoft-365',
      'github pro': 'https://github.com'
    }
    
    const key = subscription.name.toLowerCase()
    if (urlMap[key]) {
      url = urlMap[key]
    }
    
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative"
      >
        <div className="absolute inset-0 bg-gradient-primary opacity-5 blur-3xl rounded-full"></div>
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            AI-Powered Dashboard
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of subscription management with intelligent insights, 
            predictive analytics, and seamless automation
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-white/50">
            <Sparkles className="w-4 h-4" />
            <span>Real-time Analytics</span>
            <span>•</span>
            <span>Smart Notifications</span>
            <span>•</span>
            <span>Predictive Insights</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Monthly Spend"
          value={`$${analytics.totalMonthly.toFixed(2)}`}
          icon={Wallet}
          color="cyan"
        />
        <StatsCard
          title="Yearly Projection"
          value={`$${analytics.totalYearly.toFixed(2)}`}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Active Services"
          value={analytics.activeSubscriptions.toString()}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Avg. Cost"
          value={`$${analytics.averageCost.toFixed(2)}`}
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Alerts & Warnings */}
      {(analytics.upcomingBilling.length > 0 || analytics.overdueBilling.length > 0) && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-6 mb-8 border-l-4 border-orange-500"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Billing Alerts</h3>
          </div>
          
          {analytics.overdueBilling.length > 0 && (
            <div className="mb-4">
              <h4 className="text-red-400 font-medium mb-2">Overdue Payments ({analytics.overdueBilling.length})</h4>
              <div className="space-y-2">
                {analytics.overdueBilling.slice(0, 2).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-white">{sub.name}</span>
                    <span className="text-red-400 text-sm">{Math.abs(sub.daysUntilBilling)} days overdue</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {analytics.upcomingBilling.length > 0 && (
            <div>
              <h4 className="text-orange-400 font-medium mb-2">Upcoming Payments ({analytics.upcomingBilling.length})</h4>
              <div className="space-y-2">
                {analytics.upcomingBilling.slice(0, 3).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-white">{sub.name}</span>
                    <span className="text-orange-400 text-sm">in {sub.daysUntilBilling} days</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Close to Billing Cycle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Close to Billing</h3>
        </div>
        <div className="space-y-3">
          {subscriptions
            .filter(sub => {
              const daysUntil = Math.ceil((new Date(sub.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return daysUntil > 3 && daysUntil <= 7
            })
            .slice(0, 4)
            .map(sub => {
              const daysUntil = Math.ceil((new Date(sub.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{sub.name.charAt(0)}</span>
                    </div>
                    <span className="text-white">{sub.name}</span>
                  </div>
                  <span className="text-cyan-400 text-sm">{daysUntil} days</span>
                </div>
              )
            })}
          {subscriptions.filter(sub => {
            const daysUntil = Math.ceil((new Date(sub.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            return daysUntil > 3 && daysUntil <= 7
          }).length === 0 && (
            <div className="text-center py-4 text-white/60">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No subscriptions billing soon</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Spending Breakdown</h3>
          </div>
          <div className="text-sm text-white/60">
            Most expensive: {analytics.mostExpensive?.name} (${analytics.mostExpensive?.price})
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.categorySpending.slice(0, 3).map((cat, index) => (
            <div key={cat.category} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{cat.category}</span>
                <span className="text-cyan-400">${cat.amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(cat.amount / analytics.totalMonthly) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/40"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none cursor-pointer text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">{category}</option>
                ))}
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 69, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAutoDetectionOpen(true)}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-secondary text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 neon-glow"
            >
              <Bot className="w-5 h-5" />
              Auto-Detect
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-primary text-white rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 neon-glow"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Subscriptions Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}
      >
        {filteredSubscriptions.map((subscription, index) => {
          const nextBilling = new Date(subscription.nextBilling)
          const today = new Date()
          const diffTime = nextBilling.getTime() - today.getTime()
          const daysUntilBilling = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          return (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${
                daysUntilBilling <= 3 && daysUntilBilling > 0 ? 'warning-glow' :
                daysUntilBilling < 0 ? 'danger-glow' : ''
              }`}
            >
              <SubscriptionCard
                subscription={subscription}
                onDelete={deleteSubscription}
                onOpenWebsite={() => openWebsite(subscription)}
                daysUntilBilling={daysUntilBilling}
              />
            </motion.div>
          )
        })}
      </motion.div>

      {filteredSubscriptions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-16 glass-card rounded-2xl"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-semibold text-white mb-4">No subscriptions found</h3>
          <p className="text-white/60 mb-6">Try adjusting your search or filter criteria</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl transition-all"
          >
            Add Your First Subscription
          </motion.button>
        </motion.div>
      )}

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addSubscription}
      />

      {/* Auto Detection Modal */}
      <AutoDetectionModal
        isOpen={isAutoDetectionOpen}
        onClose={() => setIsAutoDetectionOpen(false)}
        onAddSubscriptions={addMultipleSubscriptions}
      />
    </div>
  )
}