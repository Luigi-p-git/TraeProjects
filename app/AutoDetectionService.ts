'use client'

// Mock implementation of automatic subscription detection
// This demonstrates the concept and can be enhanced with real APIs later

import { Subscription } from './types'

interface DetectedSubscription {
  confidence: number // 0-100
  source: 'bank_transaction' | 'email_receipt' | 'browser_detection'
  rawData: any
  suggestedSubscription: Omit<Subscription, 'id'>
}

interface BankTransaction {
  id: string
  amount: number
  merchant: string
  date: string
  description: string
  category?: string
}

class AutoDetectionService {
  // Mock bank transactions for demonstration
  private mockTransactions: BankTransaction[] = [
    {
      id: '1',
      amount: 9.99,
      merchant: 'SPOTIFY',
      date: '2024-12-15',
      description: 'SPOTIFY PREMIUM',
      category: 'entertainment'
    },
    {
      id: '2',
      amount: 15.49,
      merchant: 'NETFLIX',
      date: '2024-12-10',
      description: 'NETFLIX.COM',
      category: 'entertainment'
    },
    {
      id: '3',
      amount: 11.99,
      merchant: 'YOUTUBE',
      date: '2024-12-08',
      description: 'YOUTUBE PREMIUM',
      category: 'entertainment'
    },
    {
      id: '4',
      amount: 52.99,
      merchant: 'ADOBE',
      date: '2024-12-05',
      description: 'ADOBE CREATIVE CLOUD',
      category: 'software'
    }
  ]

  // Known subscription patterns
  private subscriptionPatterns = {
    'SPOTIFY': {
      name: 'Spotify Premium',
      category: 'Music',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/spotify.svg',
      website: 'https://spotify.com',
      color: '#1DB954'
    },
    'NETFLIX': {
      name: 'Netflix',
      category: 'Streaming',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg',
      website: 'https://netflix.com',
      color: '#E50914'
    },
    'YOUTUBE': {
      name: 'YouTube Premium',
      category: 'Streaming',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/youtube.svg',
      website: 'https://youtube.com',
      color: '#FF0000'
    },
    'ADOBE': {
      name: 'Adobe Creative Cloud',
      category: 'Design',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/adobe.svg',
      website: 'https://adobe.com',
      color: '#FF0000'
    }
  }

  // Simulate bank connection status
  private isConnected = false
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'

  // Mock API: Connect to bank (simulated)
  async connectToBank(): Promise<{ success: boolean; message: string }> {
    this.connectionStatus = 'connecting'
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful connection
    this.isConnected = true
    this.connectionStatus = 'connected'
    
    return {
      success: true,
      message: 'Successfully connected to your bank account via secure Open Banking API'
    }
  }

  // Mock API: Disconnect from bank
  async disconnectFromBank(): Promise<void> {
    this.isConnected = false
    this.connectionStatus = 'disconnected'
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus
    }
  }

  // Analyze transactions for subscription patterns
  private analyzeTransactions(transactions: BankTransaction[]): DetectedSubscription[] {
    const detectedSubscriptions: DetectedSubscription[] = []
    
    // Group transactions by merchant
    const merchantGroups = transactions.reduce((groups, transaction) => {
      const merchant = transaction.merchant.toUpperCase()
      if (!groups[merchant]) {
        groups[merchant] = []
      }
      groups[merchant].push(transaction)
      return groups
    }, {} as Record<string, BankTransaction[]>)

    // Analyze each merchant group for recurring patterns
    Object.entries(merchantGroups).forEach(([merchant, merchantTransactions]) => {
      if (merchantTransactions.length >= 1) { // For demo, detect even single transactions
        const pattern = this.subscriptionPatterns[merchant as keyof typeof this.subscriptionPatterns]
        
        if (pattern) {
          const latestTransaction = merchantTransactions[0]
          const nextBilling = new Date(latestTransaction.date)
          nextBilling.setMonth(nextBilling.getMonth() + 1) // Assume monthly
          
          detectedSubscriptions.push({
            confidence: 95,
            source: 'bank_transaction',
            rawData: merchantTransactions,
            suggestedSubscription: {
              name: pattern.name,
              price: latestTransaction.amount,
              category: pattern.category,
              billingCycle: 'monthly',
              nextBilling: nextBilling.toISOString().split('T')[0],
              logo: pattern.logo,
              website: pattern.website,
              color: pattern.color
            }
          })
        }
      }
    })

    return detectedSubscriptions
  }

  // Main detection method
  async detectSubscriptions(): Promise<DetectedSubscription[]> {
    if (!this.isConnected) {
      throw new Error('Bank account not connected. Please connect first.')
    }

    // Simulate API call to fetch transactions
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Analyze mock transactions
    const detected = this.analyzeTransactions(this.mockTransactions)
    
    return detected
  }

  // Simulate email receipt scanning
  async scanEmailReceipts(): Promise<DetectedSubscription[]> {
    // Simulate email scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock email-detected subscriptions
    return [
      {
        confidence: 88,
        source: 'email_receipt',
        rawData: { emailSubject: 'Your Figma subscription receipt' },
        suggestedSubscription: {
          name: 'Figma Professional',
          price: 12.00,
          category: 'Design',
          billingCycle: 'monthly',
          nextBilling: '2025-01-15',
          logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/figma.svg',
          website: 'https://figma.com',
          color: '#F24E1E'
        }
      }
    ]
  }

  // Get all available detection methods
  getAvailableMethods() {
    return [
      {
        id: 'bank_transactions',
        name: 'Bank Transactions',
        description: 'Analyze your bank transactions to detect recurring subscription payments',
        icon: '🏦',
        accuracy: 'Very High',
        privacy: 'Secure - No sensitive data accessed',
        status: this.isConnected ? 'connected' : 'available'
      },
      {
        id: 'email_receipts',
        name: 'Email Receipts',
        description: 'Scan your email for subscription receipts and billing confirmations',
        icon: '📧',
        accuracy: 'High',
        privacy: 'Secure - Only processes receipts',
        status: 'available'
      },
      {
        id: 'browser_detection',
        name: 'Browser Detection',
        description: 'Detect subscriptions when you sign up for services online',
        icon: '🌐',
        accuracy: 'Medium',
        privacy: 'Secure - Only public page data',
        status: 'coming_soon'
      }
    ]
  }
}

// Export singleton instance
export const autoDetectionService = new AutoDetectionService()
export type { DetectedSubscription, BankTransaction }