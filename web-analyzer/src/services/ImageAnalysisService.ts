import type { 
  ImageAnalysisResult, 
  ImageAnalysisOptions, 
  ImageAnalysisProgress,
  DetectedComponent,
  LayoutAnalysis,
  StyleExtraction,
  CodeGeneration,
  DesignSystemMatch
} from '../types/imageAnalysis'

export class ImageAnalysisService {
  private openaiApiKey: string
  private geminiApiKey: string
  private provider: 'openai' | 'gemini'
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(apiKey?: string, provider: 'openai' | 'gemini' = 'gemini') {
    this.provider = provider
    this.openaiApiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || ''
    this.geminiApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || ''
  }

  async analyzeImage(
    imageFile: File,
    options: ImageAnalysisOptions,
    onProgress?: (progress: ImageAnalysisProgress) => void
  ): Promise<ImageAnalysisResult> {
    try {
      onProgress?.({
        step: 1,
        total: 5,
        message: 'Converting image to base64...',
        stage: 'upload'
      })

      const base64Image = await this.fileToBase64(imageFile)

      onProgress?.({
        step: 2,
        total: 5,
        message: 'Analyzing UI components...',
        stage: 'processing'
      })

      const components = await this.detectComponents(base64Image, options)

      onProgress?.({
        step: 3,
        total: 5,
        message: 'Extracting layout and styles...',
        stage: 'analysis'
      })

      const layout = await this.analyzeLayout(base64Image, components)
      const styles = await this.extractStyles(base64Image, components)

      onProgress?.({
        step: 4,
        total: 5,
        message: 'Generating code...',
        stage: 'generation'
      })

      const code = await this.generateCode(components, layout, styles, options)
      const designSystem = await this.matchDesignSystem(components, styles)

      onProgress?.({
        step: 5,
        total: 5,
        message: 'Analysis complete!',
        stage: 'complete'
      })

      return {
        components,
        layout,
        styles,
        code,
        designSystem
      }
    } catch (error) {
      console.error('Image analysis error:', error)
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data:image/...;base64, prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private async callVisionAPI(
    base64Image: string,
    prompt: string,
    maxTokens: number = 2000
  ): Promise<any> {
    if (this.provider === 'gemini') {
      return this.callGeminiVision(base64Image, prompt, maxTokens)
    } else {
      return this.callGPTVision(base64Image, prompt, maxTokens)
    }
  }

  private async callGeminiVision(
    base64Image: string,
    prompt: string,
    maxTokens: number = 2000
  ): Promise<any> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key is required for image analysis')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: Math.min(maxTokens, 8192),
            temperature: 0.1
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini Vision API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Gemini API Response:', JSON.stringify(data, null, 2))
    
    // Handle different response structures
    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0]
      
      // Check for finish reason issues
      if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('Response was truncated due to token limit. Try reducing the image size or complexity.')
      }
      
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Content was blocked by safety filters. Try a different image.')
      }
      
      // Handle normal response structure
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        return candidate.content.parts[0].text
      }
      
      // Handle alternative structure where content might be directly in candidate
      if (candidate.text) {
        return candidate.text
      }
      
      // Handle case where content exists but parts is missing
      if (candidate.content && !candidate.content.parts) {
        throw new Error('Response content is incomplete. The model may have hit token limits or safety restrictions.')
      }
    }
    
    throw new Error(`Unexpected Gemini API response structure: ${JSON.stringify(data)}`)
  }

  private async callGPTVision(
    base64Image: string,
    prompt: string,
    maxTokens: number = 2000
  ): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key is required for image analysis')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content
  }

  private async detectComponents(
    base64Image: string,
    options: ImageAnalysisOptions
  ): Promise<DetectedComponent[]> {
    const prompt = `Analyze this UI and identify components. Return JSON:
{"components":[{"id":"1","type":"button|input|card|header|nav|form|text|container","name":"name","description":"purpose","position":{"x":0,"y":0,"width":100,"height":50},"properties":{"text":"content","variant":"primary|secondary","size":"small|medium|large","color":"#hex"},"confidence":0.9}]}

Identify: buttons, inputs, navigation, cards, text, images, containers. Return only valid JSON.`

    const response = await this.callVisionAPI(base64Image, prompt, 2000)
    
    try {
      const parsed = JSON.parse(response)
      return parsed.components || []
    } catch (error) {
      console.error('Failed to parse components response:', error)
      return []
    }
  }

  private async analyzeLayout(
    base64Image: string,
    components: DetectedComponent[]
  ): Promise<LayoutAnalysis> {
    const prompt = `
Analyze UI layout. Return JSON:
{
  "structure": "grid|flexbox|absolute",
  "columns": 3,
  "rows": 2,
  "gaps": {"horizontal": "16px", "vertical": "24px"},
  "alignment": "left|center|right",
  "responsive": true,
  "breakpoints": ["768px", "1024px"]
}
Identify: arrangement type, grid dimensions, spacing, alignment, responsiveness.
    `

    const response = await this.callVisionAPI(base64Image, prompt, 1000)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse layout response:', error)
      return {
        structure: 'flexbox',
        columns: 1,
        rows: 1,
        gaps: { horizontal: '16px', vertical: '16px' },
        alignment: 'left',
        responsive: true,
        breakpoints: ['768px', '1024px']
      }
    }
  }

  private async extractStyles(
    base64Image: string,
    components: DetectedComponent[]
  ): Promise<StyleExtraction> {
    const prompt = `
Extract UI design system. Return JSON:
{
  "colorPalette": {
    "primary": ["#hex1"],
    "secondary": ["#hex1"],
    "accent": ["#hex1"],
    "neutral": ["#hex1", "#hex2"]
  },
  "typography": {
    "headings": {"fontFamily": "Inter", "fontSize": ["24px", "20px"], "fontWeight": ["600"]},
    "body": {"fontFamily": "Inter", "fontSize": "14px", "fontWeight": "400"}
  },
  "spacing": {"scale": ["8px", "16px", "24px"], "unit": "px"},
  "borders": {"radius": ["4px", "8px"], "width": ["1px"], "style": ["solid"]},
  "shadows": ["0 1px 3px rgba(0,0,0,0.1)"],
  "effects": ["hover"]
}
Identify: colors, fonts, spacing, borders, shadows.
    `

    const response = await this.callVisionAPI(base64Image, prompt, 1500)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse styles response:', error)
      return {
        colorPalette: {
          primary: ['#3b82f6'],
          secondary: ['#6b7280'],
          accent: ['#10b981'],
          neutral: ['#f9fafb', '#e5e7eb', '#374151']
        },
        typography: {
          headings: {
            fontFamily: 'Inter, sans-serif',
            fontSize: ['24px', '20px', '18px'],
            fontWeight: ['600', '500'],
            lineHeight: '1.4'
          },
          body: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '1.6'
          }
        },
        spacing: {
          scale: ['4px', '8px', '12px', '16px', '24px', '32px'],
          unit: 'px'
        },
        borders: {
          radius: ['4px', '8px'],
          width: ['1px'],
          style: ['solid']
        },
        shadows: ['0 1px 3px rgba(0,0,0,0.1)'],
        effects: ['hover']
      }
    }
  }

  private async generateCode(
    components: DetectedComponent[],
    layout: LayoutAnalysis,
    styles: StyleExtraction,
    options: ImageAnalysisOptions
  ): Promise<CodeGeneration> {
    // Summarize data to reduce token usage
    const componentSummary = components.map(c => ({
      type: c.type,
      name: c.name,
      text: c.properties?.text || '',
      variant: c.properties?.variant || 'default'
    }))
    
    const prompt = `
Generate ${options.framework} code with ${options.styleFramework}. Return JSON:
{
  "html": "<div>...</div>",
  "css": ".class { ... }",
  "react": "const Component = () => <div>...</div>",
  "vue": "<template><div>...</div></template>",
  "tailwind": "<div class='...'></div>",
  "styledComponents": "const StyledDiv = styled.div\`...\`",
  "framework": "${options.framework}",
  "dependencies": ["react"],
  "instructions": "Implementation guide"
}

Components: ${JSON.stringify(componentSummary)}
Layout: ${layout.structure}, ${layout.columns}x${layout.rows}
Colors: ${JSON.stringify(styles.colorPalette.primary)}

Generate clean, responsive code following best practices.
    `

    const response = await this.callVisionAPI('', prompt, 2500)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse code generation response:', error)
      return {
        html: '<div>Generated HTML will appear here</div>',
        css: '/* Generated CSS will appear here */',
        react: 'const Component = () => { return <div>Generated React component</div> }',
        vue: '<template><div>Generated Vue component</div></template>',
        tailwind: '<div class="p-4">Generated Tailwind markup</div>',
        styledComponents: 'const StyledDiv = styled.div`padding: 1rem;`',
        framework: options.framework,
        dependencies: [],
        instructions: 'Code generation failed. Please try again.'
      }
    }
  }

  private async matchDesignSystem(
    components: DetectedComponent[],
    styles: StyleExtraction
  ): Promise<DesignSystemMatch> {
    // Simple heuristic-based design system detection
    // In a real implementation, this could use ML models or more sophisticated analysis
    
    const colorAnalysis = this.analyzeColors(styles.colorPalette)
    const componentAnalysis = this.analyzeComponentPatterns(components)
    
    let detectedSystem: DesignSystemMatch['detectedSystem'] = 'unknown'
    let confidence = 0
    
    // Material UI detection
    if (colorAnalysis.hasMaterialColors && componentAnalysis.hasMaterialPatterns) {
      detectedSystem = 'material-ui'
      confidence = 0.8
    }
    // Ant Design detection
    else if (colorAnalysis.hasAntColors && componentAnalysis.hasAntPatterns) {
      detectedSystem = 'ant-design'
      confidence = 0.75
    }
    // Bootstrap detection
    else if (componentAnalysis.hasBootstrapPatterns) {
      detectedSystem = 'bootstrap'
      confidence = 0.7
    }
    // Tailwind detection
    else if (colorAnalysis.hasTailwindColors) {
      detectedSystem = 'tailwind'
      confidence = 0.65
    }
    else {
      detectedSystem = 'custom'
      confidence = 0.5
    }
    
    return {
      detectedSystem,
      confidence,
      suggestedComponents: this.generateComponentSuggestions(components, detectedSystem),
      theme: {
        colors: this.extractThemeColors(styles.colorPalette),
        spacing: this.extractSpacingTheme(styles.spacing),
        typography: this.extractTypographyTheme(styles.typography)
      }
    }
  }

  private analyzeColors(palette: StyleExtraction['colorPalette']) {
    // Simplified color analysis
    return {
      hasMaterialColors: palette.primary.some(c => c.includes('#1976d2') || c.includes('#2196f3')),
      hasAntColors: palette.primary.some(c => c.includes('#1890ff') || c.includes('#096dd9')),
      hasTailwindColors: palette.primary.some(c => c.includes('#3b82f6') || c.includes('#1d4ed8'))
    }
  }

  private analyzeComponentPatterns(components: DetectedComponent[]) {
    return {
      hasMaterialPatterns: components.some(c => c.properties.borderRadius === '4px'),
      hasAntPatterns: components.some(c => c.properties.borderRadius === '6px'),
      hasBootstrapPatterns: components.some(c => c.type === 'button' && c.properties.padding?.includes('0.375rem'))
    }
  }

  private generateComponentSuggestions(components: DetectedComponent[], system: string) {
    return components.map(component => ({
      original: component.name,
      suggested: this.mapToSystemComponent(component.type, system),
      library: system,
      props: this.generateSystemProps(component, system)
    }))
  }

  private mapToSystemComponent(type: string, system: string): string {
    const mappings: Record<string, Record<string, string>> = {
      'material-ui': {
        button: 'Button',
        input: 'TextField',
        card: 'Card',
        header: 'AppBar'
      },
      'ant-design': {
        button: 'Button',
        input: 'Input',
        card: 'Card',
        header: 'Header'
      },
      'bootstrap': {
        button: 'btn',
        input: 'form-control',
        card: 'card',
        header: 'navbar'
      }
    }
    
    return mappings[system]?.[type] || type
  }

  private generateSystemProps(component: DetectedComponent, system: string): Record<string, any> {
    // Generate appropriate props based on the design system
    const props: Record<string, any> = {}
    
    if (component.properties.variant) {
      props.variant = component.properties.variant
    }
    
    if (component.properties.size) {
      props.size = component.properties.size
    }
    
    if (component.properties.color) {
      props.color = component.properties.color
    }
    
    return props
  }

  private extractThemeColors(palette: StyleExtraction['colorPalette']): Record<string, string> {
    return {
      primary: palette.primary[0] || '#3b82f6',
      secondary: palette.secondary[0] || '#6b7280',
      accent: palette.accent[0] || '#10b981',
      background: palette.neutral[0] || '#ffffff',
      surface: palette.neutral[1] || '#f9fafb',
      text: palette.neutral[palette.neutral.length - 1] || '#374151'
    }
  }

  private extractSpacingTheme(spacing: StyleExtraction['spacing']): Record<string, string> {
    const theme: Record<string, string> = {}
    spacing.scale.forEach((value, index) => {
      theme[`spacing-${index + 1}`] = value
    })
    return theme
  }

  private extractTypographyTheme(typography: StyleExtraction['typography']): Record<string, any> {
    return {
      fontFamily: typography.body.fontFamily,
      fontSize: {
        body: typography.body.fontSize,
        headings: typography.headings.fontSize
      },
      fontWeight: {
        normal: typography.body.fontWeight,
        bold: typography.headings.fontWeight[0]
      },
      lineHeight: {
        body: typography.body.lineHeight,
        headings: typography.headings.lineHeight
      }
    }
  }
}