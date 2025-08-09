export interface ImageAnalysisResult {
  components: DetectedComponent[]
  layout: LayoutAnalysis
  styles: StyleExtraction
  code: CodeGeneration
  designSystem: DesignSystemMatch
}

export interface DetectedComponent {
  id: string
  type: 'button' | 'input' | 'card' | 'header' | 'navigation' | 'form' | 'modal' | 'sidebar' | 'footer' | 'image' | 'text' | 'container' | 'other'
  name: string
  description: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  properties: {
    text?: string
    placeholder?: string
    variant?: string
    size?: 'small' | 'medium' | 'large'
    color?: string
    backgroundColor?: string
    borderRadius?: string
    padding?: string
    margin?: string
  }
  children?: DetectedComponent[]
  confidence: number
}

export interface LayoutAnalysis {
  structure: 'grid' | 'flexbox' | 'absolute' | 'float' | 'table'
  columns: number
  rows: number
  gaps: {
    horizontal: string
    vertical: string
  }
  alignment: 'left' | 'center' | 'right' | 'justify'
  responsive: boolean
  breakpoints: string[]
}

export interface StyleExtraction {
  colorPalette: {
    primary: string[]
    secondary: string[]
    accent: string[]
    neutral: string[]
  }
  typography: {
    headings: {
      fontFamily: string
      fontSize: string[]
      fontWeight: string[]
      lineHeight: string
    }
    body: {
      fontFamily: string
      fontSize: string
      fontWeight: string
      lineHeight: string
    }
  }
  spacing: {
    scale: string[]
    unit: 'px' | 'rem' | 'em'
  }
  borders: {
    radius: string[]
    width: string[]
    style: string[]
  }
  shadows: string[]
  effects: string[]
}

export interface CodeGeneration {
  html: string
  css: string
  react: string
  vue: string
  tailwind: string
  styledComponents: string
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
  dependencies: string[]
  instructions: string
}

export interface DesignSystemMatch {
  detectedSystem: 'material-ui' | 'ant-design' | 'chakra-ui' | 'bootstrap' | 'tailwind' | 'custom' | 'unknown'
  confidence: number
  suggestedComponents: {
    original: string
    suggested: string
    library: string
    props: Record<string, any>
  }[]
  theme: {
    colors: Record<string, string>
    spacing: Record<string, string>
    typography: Record<string, any>
  }
}

export interface ImageAnalysisProgress {
  step: number
  total: number
  message: string
  stage: 'upload' | 'processing' | 'analysis' | 'generation' | 'complete'
}

export interface ImageAnalysisOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
  styleFramework: 'css' | 'tailwind' | 'styled-components' | 'emotion' | 'sass'
  designSystem?: 'material-ui' | 'ant-design' | 'chakra-ui' | 'bootstrap' | 'custom'
  responsive: boolean
  includeInteractions: boolean
  outputFormat: 'code' | 'json' | 'both'
}