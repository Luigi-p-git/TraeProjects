'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: 'cyan' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  cyan: {
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/25',
    icon: 'text-cyan-400',
    border: 'border-cyan-500/30'
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    glow: 'shadow-green-500/25',
    icon: 'text-green-400',
    border: 'border-green-500/30'
  },
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    glow: 'shadow-purple-500/25',
    icon: 'text-purple-400',
    border: 'border-purple-500/30'
  },
  orange: {
    gradient: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/25',
    icon: 'text-orange-400',
    border: 'border-orange-500/30'
  },
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorConfig = colorClasses[color]
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass-card rounded-2xl p-6 border ${colorConfig.border} relative overflow-hidden group hover:scale-105 transition-all duration-300`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating particles */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-4 right-8 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">{title}</p>
          <motion.p 
            className="text-3xl font-bold text-white mb-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {value}
          </motion.p>
          <div className={`w-12 h-1 bg-gradient-to-r ${colorConfig.gradient} rounded-full`} />
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={`p-4 rounded-2xl bg-gradient-to-br ${colorConfig.gradient} shadow-lg ${colorConfig.glow} relative`}
        >
          <Icon className="w-7 h-7 text-white" />
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
        </motion.div>
      </div>
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl ${colorConfig.glow} opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`} />
    </motion.div>
  )
}