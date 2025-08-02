'use client'

import { motion } from 'framer-motion'
import { Trash2, Calendar, DollarSign, ExternalLink, AlertTriangle, Clock, Zap } from 'lucide-react'
import { Subscription } from './types'

interface SubscriptionCardProps {
  subscription: Subscription
  onDelete: (id: string) => void
  onOpenWebsite?: () => void
  daysUntilBilling?: number
}

export default function SubscriptionCard({ 
  subscription, 
  onDelete, 
  onOpenWebsite,
  daysUntilBilling = 0
}: SubscriptionCardProps) {
  const nextBilling = new Date(subscription.nextBilling)
  const today = new Date()
  const diffTime = nextBilling.getTime() - today.getTime()
  const daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // Calculate days passed in current billing cycle
  const cycleDays = subscription.billingCycle === 'monthly' ? 30 : 365
  const daysPassed = daysUntilNext <= 0 ? Math.abs(daysUntilNext) : cycleDays + daysUntilNext
  
  const getDaysInCycle = (cycle: string) => {
    return cycle === 'monthly' ? 30 : 365
  }
  
  const totalDays = getDaysInCycle(subscription.billingCycle)
  const progressPercentage = daysUntilNext <= 0 ? 100 : Math.min(Math.max(((cycleDays - daysUntilNext) / totalDays) * 100, 0), 100)

  const getStatusColor = () => {
    if (daysUntilNext < 0) return 'border-red-500/60 bg-red-500/8 shadow-lg shadow-red-500/20'
    if (daysUntilNext <= 3) return 'border-orange-500/60 bg-orange-500/8 shadow-lg shadow-orange-500/20'
    return 'border-cyan-500/30 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
  }

  const getStatusIcon = () => {
    if (daysUntilNext < 0) return <AlertTriangle className="w-4 h-4 text-red-400" />
    if (daysUntilNext <= 3) return <Clock className="w-4 h-4 text-orange-400" />
    return <Zap className="w-4 h-4 text-cyan-400" />
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 border ${getStatusColor()} group relative overflow-hidden`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {getStatusIcon()}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(subscription.id)}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="relative z-10">
        <div className="flex items-start space-x-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg"
          >
            {subscription.logo ? (
              <img 
                src={subscription.logo} 
                alt={subscription.name} 
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              subscription.name.charAt(0)
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-xl mb-1 truncate">{subscription.name}</h3>
            <p className="text-sm text-white/60 capitalize mb-2">{subscription.category}</p>
            {onOpenWebsite && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenWebsite}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Visit Website</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Price and billing info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-3xl font-bold text-white">${subscription.price}</span>
            </div>
            <span className="text-sm text-white/60 capitalize bg-white/10 px-3 py-1 rounded-full border border-white/20">
              {subscription.billingCycle}
            </span>
          </div>

          {/* Billing status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Next billing</span>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <span className="text-white font-medium">{nextBilling.toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Billing warning */}
            {(daysUntilBilling <= 3 || daysUntilBilling < 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  daysUntilBilling < 0 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}
              >
                <div className="flex items-center space-x-2 text-sm">
                  {daysUntilBilling < 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Payment overdue by {Math.abs(daysUntilNext)} days</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Due in {daysUntilBilling} days</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/50">
                <span>{subscription.billingCycle === 'monthly' ? '30-day' : '365-day'} cycle</span>
                <span>{progressPercentage.toFixed(0)}% • {daysPassed}/{totalDays} days</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className="bg-gradient-primary h-2 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}