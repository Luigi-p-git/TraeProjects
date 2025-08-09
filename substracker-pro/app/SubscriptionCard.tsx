'use client'

import { motion } from 'framer-motion'
import { Trash2, Calendar, DollarSign, ExternalLink, AlertTriangle, Clock, Zap } from 'lucide-react'
import Image from 'next/image'
import { Subscription } from './types'

interface SubscriptionCardProps {
  subscription: Subscription
  onDelete: (id: string) => void
  onOpenWebsite?: () => void
  daysUntilBilling?: number
}

// Helper function to get service key for logo mapping
const getServiceKey = (serviceName: string): string => {
  const serviceMap: Record<string, string> = {
    'netflix': 'netflix',
    'youtube': 'youtube', 
    'spotify': 'spotify',
    'adobe': 'adobe',
    'amazon prime': 'amazon-prime',
    'apple': 'apple',
    'discord': 'discord',
    'dropbox': 'dropbox',
    'figma': 'figma',
    'github': 'github',
    'hulu': 'hulu',
    'microsoft': 'microsoft',
    'slack': 'slack'
  }
  
  const key = serviceName.toLowerCase()
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '-')
  return serviceMap[key] || normalizedName
}

export default function SubscriptionCard({ 
  subscription, 
  onDelete, 
  onOpenWebsite,
  daysUntilBilling = 0
}: SubscriptionCardProps) {
  const today = new Date()
  const nextBilling = new Date(subscription.nextBilling)
  
  const totalDays = subscription.billingCycle === 'monthly' ? 30 : 365
  const daysUntilNext = Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const daysPassed = daysUntilNext <= 0 ? Math.abs(daysUntilNext) : totalDays - daysUntilNext
  const progressPercentage = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100)
  
  const isOverdue = today > nextBilling
  const daysDifference = Math.floor((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isUpcoming = daysDifference <= 3 && daysDifference > 0
  
  const getStatusColor = () => {
    if (isOverdue) return 'bg-red-500/8 shadow-lg shadow-red-500/20'
    if (isUpcoming) return 'bg-yellow-500/8 shadow-lg shadow-yellow-500/20'
    return 'bg-white/5 shadow-lg shadow-white/10'
  }
  
  const getStatusIcon = () => {
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-red-400" />
    if (isUpcoming) return <Clock className="w-4 h-4 text-yellow-400" />
    return <Zap className="w-4 h-4 text-green-400" />
  }
  
  const getStatusClass = () => {
    if (isOverdue) return 'danger-glow'
    if (isUpcoming) return 'warning-glow'
    return ''
  }
  
  const logoPath = `/logos/${getServiceKey(subscription.name)}.svg`

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${getStatusClass()}`}
    >
      <div 
        className={`
          relative p-6 group
          bg-gradient-to-br from-white/5 to-white/2
          backdrop-blur-xl
          transition-all duration-500
          hover:shadow-2xl
          ${getStatusColor()}
        `}
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isOverdue ? 'rgba(239, 68, 68, 0.6)' : 
                      isUpcoming ? 'rgba(245, 158, 11, 0.6)' : 
                      'rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ borderRadius: '16px' }}
        />
        
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
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
              className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-lg relative"
              style={{
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image
                  src={logoPath}
                  alt={`${subscription.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = subscription.name.charAt(0).toUpperCase()
                      parent.className += ' text-white font-bold text-xl'
                    }
                  }}
                />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-xl mb-1 truncate">{subscription.name}</h3>
              <p className="text-sm text-white/60 capitalize mb-2">{subscription.category}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenWebsite}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Visit Website</span>
              </motion.button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-white">${subscription.price}</span>
              </div>
              <span className="text-sm text-white/60 capitalize bg-white/10 px-3 py-1 border border-white/20" style={{ borderRadius: '20px' }}>
                {subscription.billingCycle}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Next billing</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className="text-white font-medium">{nextBilling.toLocaleDateString()}</span>
                </div>
              </div>
              
              {(isOverdue || isUpcoming) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 border ${
                    isOverdue 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  }`}
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {isOverdue ? (
                        `Payment overdue by ${Math.abs(daysDifference)} days`
                      ) : (
                        `Due in ${daysUntilBilling} days`
                      )}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/50">
                  <span>{subscription.billingCycle === 'monthly' ? '30-day' : '365-day'} cycle</span>
                  <span>{progressPercentage.toFixed(0)}% • {daysPassed}/{totalDays} days</span>
                </div>
                <div 
                  className="w-full bg-white/10 h-2 relative"
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    className="h-2 relative"
                    style={{
                      background: 'linear-gradient(90deg, #00d4ff 0%, #8b5cf6 50%, #f97316 100%)',
                      borderRadius: '10px'
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-white/20 animate-pulse"
                      style={{ borderRadius: '10px' }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}