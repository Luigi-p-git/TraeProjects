export interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  hosting: string[]
  analytics: string[]
}

export interface Design {
  colors: string[]
  fonts: string[]
  spacing: string
  breakpoints: string[]
}

export interface Performance {
  loadTime: number
  sizeKB: number
  requests: number
  score: number
}

export interface SEO {
  title: string
  description: string
  keywords: string[]
  metaTags: number
}

export interface Component {
  name: string
  type: string
  size: string
  description?: string
  props?: string[]
  children?: number
  complexity?: 'simple' | 'moderate' | 'complex'
}

export interface VisualAnalysis {
  hasAnimations: boolean
  animations: string[]
  backgroundType: string
  background: string[]
  hasGraphics: boolean
  graphics: string[]
  hasVisualEffects: boolean
  effects: string[]
  colorScheme: string[]
  layout: string[]
}

export interface CodeExtraction {
  hasReactComponents: boolean
  hasVueComponents: boolean
  jsonData: any[]
  configFiles: string[]
  apiEndpoints: string[]
  externalLibraries: string[]
  inlineScripts: string[]
  components: string[]
}

export interface AnalysisData {
  url: string
  techStack: TechStack
  design: Design
  performance: Performance
  seo: SEO
  components: Component[]
  visualAnalysis: VisualAnalysis
  codeExtraction: CodeExtraction
  recreation?: WebsiteRecreation
  screenshot?: string
}

export interface WebsiteRecreation {
  html: string
  css: string
  javascript: string
  framework: 'vanilla' | 'react' | 'vue'
  dependencies: string[]
  instructions: string
}

export interface AnalysisProgress {
  step: string
  progress: number
  message: string
}