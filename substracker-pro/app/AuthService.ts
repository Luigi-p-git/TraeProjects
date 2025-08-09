'use client'

// Authentication Service with Developer Mode and Google OAuth
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: 'google' | 'email' | 'developer'
  emailAccounts: EmailAccount[]
  isDeveloperMode: boolean
}

export interface EmailAccount {
  id: string
  email: string
  provider: 'gmail' | 'outlook' | 'yahoo' | 'other'
  isConnected: boolean
  lastScan?: Date
  subscriptionCount?: number
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState))
  }

  private updateState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates }
    this.notifyListeners()
    this.saveToStorage()
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_state', JSON.stringify(this.authState))
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('auth_state')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.authState = { ...this.authState, ...parsed }
          this.notifyListeners()
        }
      } catch (error) {
        console.error('Failed to load auth state:', error)
      }
    }
  }

  // Initialize auth service
  init() {
    this.loadFromStorage()
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.authState
  }

  // Alias for backward compatibility
  getState(): AuthState {
    return this.authState
  }

  // Developer Mode Login (for testing)
  async loginDeveloperMode(email?: string): Promise<{ success: boolean; message?: string }> {
    this.updateState({ isLoading: true, error: null })
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const developerUser: User = {
        id: 'dev_user_' + Date.now(),
        email: email || 'developer@example.com',
        name: 'Developer User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
        provider: 'developer',
        isDeveloperMode: true,
        emailAccounts: [
          {
            id: 'dev_email_1',
            email: email || 'developer@example.com',
            provider: 'gmail',
            isConnected: true,
            lastScan: new Date(),
            subscriptionCount: 8
          }
        ]
      }
      
      this.updateState({
        isAuthenticated: true,
        user: developerUser,
        isLoading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: 'Developer login failed'
      })
      return { success: false, message: 'Developer login failed' }
    }
  }

  // Google OAuth Login (mock implementation)
  async loginWithGoogle(): Promise<{ success: boolean; message?: string }> {
    this.updateState({ isLoading: true, error: null })
    
    try {
      // In a real app, this would use Google OAuth SDK
      // For now, we'll simulate the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock Google user data
      const googleUser: User = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        provider: 'google',
        isDeveloperMode: false,
        emailAccounts: [
          {
            id: 'google_email_1',
            email: 'user@gmail.com',
            provider: 'gmail',
            isConnected: true,
            lastScan: new Date(),
            subscriptionCount: 12
          }
        ]
      }
      
      this.updateState({
        isAuthenticated: true,
        user: googleUser,
        isLoading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: 'Google login failed'
      })
      return { success: false, message: 'Google login failed' }
    }
  }

  // Email/Password Login (mock implementation)
  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    this.updateState({ isLoading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation (in real app, this would be server-side)
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      
      const emailUser: User = {
        id: 'email_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email',
        isDeveloperMode: false,
        emailAccounts: [
          {
            id: 'email_account_1',
            email: email,
            provider: email.includes('gmail') ? 'gmail' : email.includes('outlook') ? 'outlook' : 'other',
            isConnected: true,
            lastScan: new Date(),
            subscriptionCount: 5
          }
        ]
      }
      
      this.updateState({
        isAuthenticated: true,
        user: emailUser,
        isLoading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      })
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  // Sign Up (mock implementation)
  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> {
    this.updateState({ isLoading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      
      const newUser: User = {
        id: 'new_' + Date.now(),
        email: email,
        name: name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email',
        isDeveloperMode: false,
        emailAccounts: [
          {
            id: 'new_email_1',
            email: email,
            provider: email.includes('gmail') ? 'gmail' : email.includes('outlook') ? 'outlook' : 'other',
            isConnected: false,
            subscriptionCount: 0
          }
        ]
      }
      
      this.updateState({
        isAuthenticated: true,
        user: newUser,
        isLoading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      })
      return { success: false, message: error instanceof Error ? error.message : 'Sign up failed' }
    }
  }

  // Add additional email account
  async addEmailAccount(email: string, provider: 'gmail' | 'outlook' | 'yahoo' | 'other' = 'other'): Promise<{ success: boolean; message?: string }> {
    if (!this.authState.user) {
      return { success: false, message: 'User not authenticated' }
    }
    
    try {
      // Simulate email connection process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newEmailAccount: EmailAccount = {
        id: 'email_' + Date.now(),
        email: email,
        provider: provider,
        isConnected: true,
        lastScan: new Date(),
        subscriptionCount: Math.floor(Math.random() * 10) + 1
      }
      
      const updatedUser = {
        ...this.authState.user,
        emailAccounts: [...this.authState.user.emailAccounts, newEmailAccount]
      }
      
      this.updateState({
        user: updatedUser
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Failed to add email account' }
    }
  }

  // Remove email account
  async removeEmailAccount(emailId: string): Promise<{ success: boolean; message?: string }> {
    if (!this.authState.user) {
      return { success: false, message: 'User not authenticated' }
    }
    
    try {
      const updatedUser = {
        ...this.authState.user,
        emailAccounts: this.authState.user.emailAccounts.filter(account => account.id !== emailId)
      }
      
      this.updateState({
        user: updatedUser
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Failed to remove email account' }
    }
  }

  // Scan email for subscriptions
  async scanEmailAccount(emailId: string): Promise<{ success: boolean; subscriptions?: any[]; message?: string }> {
    if (!this.authState.user) {
      return { success: false, message: 'User not authenticated' }
    }
    
    try {
      // Simulate email scanning
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock detected subscriptions
      const mockSubscriptions = [
        {
          name: 'Spotify Premium',
          price: 9.99,
          billingCycle: 'monthly',
          category: 'Entertainment',
          nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          color: '#1DB954',
          logo: '/logos/spotify.svg'
        },
        {
          name: 'Adobe Creative Cloud',
          price: 52.99,
          billingCycle: 'monthly',
          category: 'Productivity',
          nextBilling: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          color: '#FF0000',
          logo: '/logos/adobe.svg'
        }
      ]
      
      // Update email account scan info
      const updatedUser = {
        ...this.authState.user,
        emailAccounts: this.authState.user.emailAccounts.map(account => 
          account.id === emailId 
            ? { ...account, lastScan: new Date(), subscriptionCount: mockSubscriptions.length }
            : account
        )
      }
      
      this.updateState({
        user: updatedUser
      })
      
      return { success: true, subscriptions: mockSubscriptions }
    } catch (error) {
      return { success: false, message: 'Failed to scan email' }
    }
  }

  // Logout
  async logout(): Promise<void> {
    this.updateState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    })
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_state')
    }
  }

  // Check if user has email scanning capability
  canScanEmails(): boolean {
    return this.authState.user?.emailAccounts.some(account => account.isConnected) || false
  }

  // Get connected email accounts
  getConnectedEmails(): EmailAccount[] {
    return this.authState.user?.emailAccounts.filter(account => account.isConnected) || []
  }
}

export const authService = AuthService.getInstance()