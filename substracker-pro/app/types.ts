export interface Subscription {
  id: string
  name: string
  price: number
  category: string
  billingCycle: 'monthly' | 'yearly'
  nextBilling: string
  logo: string
  website: string
  color: string
}