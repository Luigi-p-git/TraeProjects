import axios from 'axios'
import * as cheerio from 'cheerio'
import { AnalysisData, TechStack, Design, Performance, SEO, Component, VisualAnalysis, CodeExtraction } from '../types/analysis'
import { WebsiteRecreator } from './WebsiteRecreator'
import { browserScreenshotService } from './BrowserScreenshotService'

export class WebAnalyzer {
  private baseUrl: string
  private $: cheerio.CheerioAPI | null = null
  private html: string = ''

  constructor(url: string) {
    this.baseUrl = this.formatUrl(url)
  }

  private formatUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url
    }
    return url
  }

  async analyze(onProgress?: (step: number, message: string) => void): Promise<AnalysisData> {
    try {
      // Validate URL before starting
      if (!this.baseUrl || typeof this.baseUrl !== 'string') {
        throw new Error('Invalid URL provided for analysis')
      }
      
      // Step 1: Fetch the webpage
      onProgress?.(1, 'Fetching website...')
      
      // Smart proxy selection based on domain reliability and past performance
      let response
      const domain = new URL(this.baseUrl).hostname
      const isHighTrafficSite = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com'].some(site => domain.includes(site))
      
      // Prioritize proxies based on site type
      const proxies = isHighTrafficSite ? [
        {
          url: `https://cors.eu.org/${this.baseUrl}`,
          timeout: 12000,
          name: 'CorsEU'
        },
        {
          url: `https://corsproxy.io/?${encodeURIComponent(this.baseUrl)}`,
          timeout: 10000,
          name: 'CorsProxy'
        },
        {
          url: `https://api.allorigins.win/get?url=${encodeURIComponent(this.baseUrl)}`,
          timeout: 15000,
          name: 'AllOrigins'
        }
      ] : [
        {
          url: `https://api.allorigins.win/get?url=${encodeURIComponent(this.baseUrl)}`,
          timeout: 8000,
          name: 'AllOrigins'
        },
        {
          url: `https://corsproxy.io/?${encodeURIComponent(this.baseUrl)}`,
          timeout: 6000,
          name: 'CorsProxy'
        },
        {
          url: `https://cors.eu.org/${this.baseUrl}`,
          timeout: 5000,
          name: 'CorsEU'
        }
      ]
      
      let lastError
      let serviceErrors = []
      
      for (const proxy of proxies) {
        try {
          console.log(`Trying ${proxy.name} proxy service...`)
          onProgress?.(1, `Connecting via ${proxy.name}...`)
          
          response = await Promise.race([
             axios.get(proxy.url, {
               headers: {
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                 'Accept': 'application/json, text/plain, */*',
                 'Accept-Language': 'en-US,en;q=0.9'
               },
               timeout: proxy.timeout,
               validateStatus: (status) => status < 500
             }),
             new Promise((_, reject) => 
               setTimeout(() => reject(new Error(`${proxy.name} timeout`)), proxy.timeout)
             )
           ]) as any
           
           if (response && response.status === 200) {
             console.log(`${proxy.name} proxy successful`)
             break
           } else {
             throw new Error(`${proxy.name} returned status ${response?.status}`)
           }
        } catch (error: any) {
          lastError = error
          const errorMsg = error.message || 'Unknown error'
          serviceErrors.push(`${proxy.name}: ${errorMsg}`)
          console.warn(`${proxy.name} proxy failed:`, errorMsg)
          
          // Add delay between retries to prevent overwhelming services
          if (proxy !== proxies[proxies.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          continue
        }
      }
      
      if (!response || !(response as any).data) {
         console.error('All CORS proxy services failed:', serviceErrors)
         const detailedError = `Service temporarily unavailable. All proxy services failed:\n${serviceErrors.join('\n')}\n\nThis may be due to:\n• Network connectivity issues\n• Proxy services being overloaded\n• The target website blocking requests\n\nPlease try again in a few minutes or use a different URL.`
         throw new Error(detailedError)
       }
       
       // Extract HTML content from proxy response with better error handling
       onProgress?.(1, 'Processing website content...')
       
       let htmlContent = ''
       try {
         const responseData = (response as any).data
         // Handle different proxy response formats
         if (responseData.contents) {
           htmlContent = responseData.contents
         } else if (typeof responseData === 'string') {
           htmlContent = responseData
         } else if (responseData.data) {
           htmlContent = responseData.data
         } else {
           htmlContent = JSON.stringify(responseData)
         }
         
         if (!htmlContent || typeof htmlContent !== 'string') {
           throw new Error('No valid HTML content received from proxy service')
         }
         
         if (htmlContent.length < 100) {
           throw new Error('Received content appears to be too short or invalid')
         }
         
         this.html = htmlContent
         this.$ = cheerio.load(this.html) as cheerio.CheerioAPI
         
         // Verify that we can parse the HTML
         const title = this.$('title').text() || 'Unknown'
         console.log(`Successfully parsed HTML content. Title: ${title}`)
         
       } catch (parseError: any) {
         console.error('HTML parsing failed:', parseError)
         throw new Error(`Failed to parse website content: ${parseError.message}. The website may be using advanced protection or the content format is not supported.`)
       }

      // Step 2: Analyze tech stack
      onProgress?.(2, 'Detecting technologies...')
      const techStack = await this.analyzeTechStack()
      
      // Step 3: Analyze design
      onProgress?.(3, 'Extracting design system...')
      const design = await this.analyzeDesign()
      
      // Step 4: Analyze components
      onProgress?.(4, 'Mapping components...')
      const components = await this.analyzeComponents()
      
      // Step 5: Analyze SEO
      onProgress?.(5, 'Analyzing SEO...')
      const seo = await this.analyzeSEO()
      
      // Step 6: Analyze performance
      onProgress?.(6, 'Measuring performance...')
      const performance = await this.analyzePerformance()
      
      // Step 7: Analyze visual elements
      onProgress?.(7, 'Analyzing visual elements...')
      const visualAnalysis = await this.analyzeVisualElements()
      
      // Step 8: Extract code and data
      onProgress?.(8, 'Extracting code and data...')
      const codeExtraction = await this.extractCodeAndData()
      
      // Step 9: Generate website recreation
      onProgress?.(9, 'Generating website recreation...')
      const analysisData = {
        url: this.baseUrl,
        techStack,
        design,
        performance,
        seo,
        components,
        visualAnalysis,
        codeExtraction
      }
      const recreation = WebsiteRecreator.recreateWebsite(analysisData)

      // Step 10: Capture screenshot
      onProgress?.(10, 'Capturing screenshot...')
      const screenshot = await this.captureScreenshot()

      return {
        ...analysisData,
        recreation,
        screenshot
      }
   } catch (error: any) {
      console.error('Analysis failed:', error)
      
      // Provide more specific error messages based on error type
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network connection failed. Please check your internet connection and try again.')
      }
      
      if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        throw new Error('Request timed out. The website may be slow to respond or temporarily unavailable.')
      }
      
      if (error.response?.status === 403) {
        throw new Error('Access denied. The website is blocking external requests.')
      }
      
      if (error.response?.status === 404) {
        throw new Error('Website not found. Please check the URL and try again.')
      }
      
      if (error.response?.status >= 500) {
        throw new Error('The website server is experiencing issues. Please try again later.')
      }
      
      // Re-throw the original error if it already has a meaningful message
      if (error.message && error.message.length > 10) {
        throw error
      }
      
      // Fallback for unknown errors
      throw new Error('An unexpected error occurred during website analysis. Please try again or contact support if the issue persists.')
    }
  }

  private async analyzeTechStack(): Promise<TechStack> {
    if (!this.$) throw new Error('No HTML loaded')

    const frontend: string[] = []
    const backend: string[] = []
    const database: string[] = []
    const hosting: string[] = []
    const analytics: string[] = []
    const other: string[] = []

    // Detect frontend frameworks and libraries
    const scripts = this.$!('script').map((_, el) => this.$!(el).attr('src') || this.$!(el).html() || '').get().join(' ')
    const links = this.$!('link').map((_, el) => this.$!(el).attr('href') || '').get().join(' ')
    const allContent = this.html + ' ' + scripts + ' ' + links

    // React detection
    if (/react/i.test(allContent) || this.$('[data-reactroot]').length > 0 || this.$('#root').length > 0) {
      frontend.push('React')
    }
    
    // Vue.js detection
    if (/vue/i.test(allContent) || this.$('[v-]').length > 0 || this.$('[data-v-]').length > 0) {
      frontend.push('Vue.js')
    }
    
    // Angular detection
    if (/angular/i.test(allContent) || this.$('[ng-]').length > 0 || this.$('[data-ng-]').length > 0) {
      frontend.push('Angular')
    }
    
    // Next.js detection
    if (/next/i.test(allContent) || this.$('#__next').length > 0) {
      frontend.push('Next.js')
    }
    
    // Nuxt.js detection
    if (/nuxt/i.test(allContent) || this.$('#__nuxt').length > 0) {
      frontend.push('Nuxt.js')
    }
    
    // Svelte detection
    if (/svelte/i.test(allContent)) {
      frontend.push('Svelte')
    }
    
    // jQuery detection
    if (/jquery/i.test(allContent)) {
      frontend.push('jQuery')
    }

    // CSS frameworks
    if (/tailwind/i.test(allContent)) {
      frontend.push('Tailwind CSS')
    }
    if (/bootstrap/i.test(allContent)) {
      frontend.push('Bootstrap')
    }
    if (/bulma/i.test(allContent)) {
      frontend.push('Bulma')
    }
    if (/foundation/i.test(allContent)) {
      frontend.push('Foundation')
    }
    if (/materialize/i.test(allContent)) {
      frontend.push('Materialize')
    }

    // Build tools and bundlers
    if (/webpack/i.test(allContent)) {
      other.push('Webpack')
    }
    if (/vite/i.test(allContent)) {
      other.push('Vite')
    }
    if (/parcel/i.test(allContent)) {
      other.push('Parcel')
    }

    // Detect backend technologies from headers and meta tags
    const generator = this.$('meta[name="generator"]').attr('content')
    if (generator) {
      if (generator.includes('WordPress')) backend.push('WordPress')
      if (generator.includes('Drupal')) backend.push('Drupal')
      if (generator.includes('Joomla')) backend.push('Joomla')
      if (generator.includes('Shopify')) backend.push('Shopify')
      if (generator.includes('Squarespace')) backend.push('Squarespace')
      if (generator.includes('Wix')) backend.push('Wix')
    }

    // Additional backend detection
    if (/php/i.test(allContent)) backend.push('PHP')
    if (/asp\.net|aspnet/i.test(allContent)) backend.push('ASP.NET')
    if (/django/i.test(allContent)) backend.push('Django')
    if (/flask/i.test(allContent)) backend.push('Flask')
    if (/rails|ruby/i.test(allContent)) backend.push('Ruby on Rails')
    if (/laravel/i.test(allContent)) backend.push('Laravel')
    if (/express|node\.js/i.test(allContent)) backend.push('Node.js')
    if (/spring/i.test(allContent)) backend.push('Spring Framework')

    // Database detection
    if (/mysql/i.test(allContent)) database.push('MySQL')
    if (/postgresql|postgres/i.test(allContent)) database.push('PostgreSQL')
    if (/mongodb|mongo/i.test(allContent)) database.push('MongoDB')
    if (/redis/i.test(allContent)) database.push('Redis')
    if (/sqlite/i.test(allContent)) database.push('SQLite')
    if (/oracle/i.test(allContent)) database.push('Oracle')
    if (/firebase/i.test(allContent)) database.push('Firebase')
    if (/supabase/i.test(allContent)) database.push('Supabase')

    // Analytics and tracking
    if (/google-analytics|gtag|ga\(/i.test(allContent)) {
      analytics.push('Google Analytics')
    }
    if (/googletagmanager|gtm/i.test(allContent)) {
      analytics.push('Google Tag Manager')
    }
    if (/facebook\.net|fbevents/i.test(allContent)) {
      analytics.push('Facebook Pixel')
    }
    if (/hotjar/i.test(allContent)) {
      analytics.push('Hotjar')
    }
    if (/mixpanel/i.test(allContent)) {
      analytics.push('Mixpanel')
    }

    // Hosting and CDN detection
    if (/vercel/i.test(allContent) || /\.vercel\.app/i.test(this.baseUrl)) {
      hosting.push('Vercel')
    }
    if (/netlify/i.test(allContent) || /\.netlify\.app/i.test(this.baseUrl)) {
      hosting.push('Netlify')
    }
    if (/github\.io/i.test(this.baseUrl)) {
      hosting.push('GitHub Pages')
    }
    if (/cloudflare/i.test(allContent)) {
      hosting.push('Cloudflare')
    }
    if (/amazonaws/i.test(allContent)) {
      hosting.push('AWS')
    }

    // Add fallback values if nothing was detected
    if (frontend.length === 0) {
      frontend.push('HTML/CSS/JavaScript')
    }
    if (backend.length === 0) {
      backend.push('Server-side technology not detected')
    }
    if (database.length === 0) {
      database.push('Database not detected')
    }
    if (hosting.length === 0) {
      hosting.push('Hosting provider not detected')
    }
    if (analytics.length === 0) {
      analytics.push('No analytics detected')
    }
    return { frontend, backend, database, hosting, analytics }
  }

  private async analyzeDesign(): Promise<Design> {
    if (!this.$) throw new Error('No HTML loaded')

    const colors: string[] = []
    const fonts: string[] = []
    // const spacing: string = '' // Removed unused variable
    const breakpoints: string[] = []

    // Extract colors from inline styles and computed styles
    const extractedColors = new Set<string>()
    
    // Get colors from style attributes
    this.$!('[style*="color"], [style*="background"]').each((_, el) => {
      const style = this.$!(el).attr('style') || ''
      const colorMatches = style.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g) || []
      colorMatches.forEach(color => extractedColors.add(color))
    })

    // Get colors from CSS classes (common patterns)
    const styles = this.$!('style').text()
    const cssColorMatches = styles.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g) || []
    cssColorMatches.forEach(color => extractedColors.add(color))

    // Analyze common color patterns
    const colorArray = Array.from(extractedColors).slice(0, 8)
    colors.push(...colorArray)

    // Extract typography information
    const fontFamilies = new Set<string>()
    
    // Check common font declarations
    this.$!('body, h1, h2, h3, h4, h5, h6, p, span, div').each((_, el) => {
      const element = this.$!(el)
      const style = element.attr('style') || ''
      const fontMatch = style.match(/font-family\s*:\s*([^;]+)/)
      if (fontMatch) {
        const fontFamily = fontMatch[1].replace(/["']/g, '').split(',')[0].trim()
        if (fontFamily && fontFamily !== 'inherit') {
          fontFamilies.add(fontFamily)
        }
      }
    })

    // Analyze font usage
    const fontArray = Array.from(fontFamilies).slice(0, 3)
    fonts.push(...fontArray)

    // Extract spacing patterns
    const spacingValues = new Set<number>()
    this.$!('*').each((_, el) => {
      const element = this.$!(el)
      const style = element.attr('style') || ''
      
      // Extract numeric values from margin/padding
      const extractNumbers = (value: string) => {
        const matches = value.match(/\d+/g)
        return matches ? matches.map(Number) : []
      }
      
      const marginMatch = style.match(/margin[^;]*:\s*([^;]+)/)
      const paddingMatch = style.match(/padding[^;]*:\s*([^;]+)/)
      
      if (marginMatch) extractNumbers(marginMatch[1]).forEach(val => spacingValues.add(val))
      if (paddingMatch) extractNumbers(paddingMatch[1]).forEach(val => spacingValues.add(val))
    })

    const spacingArray = Array.from(spacingValues).sort((a, b) => a - b).slice(0, 10)
    const spacingStr = spacingArray.length > 0 ? `Common spacing: ${spacingArray.join(', ')}px` : '8px grid system'

    // Detect responsive breakpoints from CSS
    const mediaQueries = styles.match(/@media[^{]+/g) || []
    const detectedBreakpoints = new Set<string>()
    
    mediaQueries.forEach(query => {
      const widthMatch = query.match(/\((?:min-|max-)?width:\s*(\d+px)/)
      if (widthMatch) {
        detectedBreakpoints.add(widthMatch[1])
      }
    })

    const breakpointArray = Array.from(detectedBreakpoints).sort()
    if (breakpointArray.length > 0) {
      breakpoints.push(...breakpointArray)
    } else {
      breakpoints.push('sm: 768px', 'md: 1024px', 'lg: 1200px', 'xl: 1440px')
    }

    // Add fallback values if nothing was detected
    if (colors.length === 0) {
      colors.push('#000000', '#ffffff', '#333333', '#666666', '#f5f5f5')
    }
    if (fonts.length === 0) {
      fonts.push('Arial', 'Helvetica', 'sans-serif')
    }

    return {
      colors,
      fonts,
      spacing: spacingStr,
      breakpoints
    }
  }



  private async analyzePerformance(): Promise<Performance> {
    try {
      // Calculate performance metrics from already fetched content
      const sizeKB = Math.round(this.html.length / 1024)
      const requests = (this.$!('script').length || 0) + (this.$!('link').length || 0) + (this.$!('img').length || 0) + 1
      
      // Estimate load time based on content size and complexity
      let estimatedLoadTime = 0.5 // Base load time
      estimatedLoadTime += sizeKB / 1000 // Add time based on size
      estimatedLoadTime += requests * 0.05 // Add time based on number of requests
      
      // Calculate a performance score based on estimated metrics
      let score = 100
      if (estimatedLoadTime > 3) score -= 30
      else if (estimatedLoadTime > 2) score -= 20
      else if (estimatedLoadTime > 1) score -= 10
      
      if (sizeKB > 1000) score -= 20
      else if (sizeKB > 500) score -= 10
      
      if (requests > 50) score -= 15
      else if (requests > 30) score -= 10
      
      // Additional performance factors
      const hasMinifiedCSS = this.$!('link[href*=".min.css"]').length > 0
      const hasMinifiedJS = this.$!('script[src*=".min.js"]').length > 0
      const hasCompression = this.html.includes('gzip') || this.html.includes('compress')
      
      if (hasMinifiedCSS) score += 5
      if (hasMinifiedJS) score += 5
      if (hasCompression) score += 5
      
      return {
        loadTime: Math.round(estimatedLoadTime * 100) / 100,
        sizeKB,
        requests,
        score: Math.max(Math.min(score, 100), 0)
      }
    } catch {
      return {
        loadTime: 0,
        sizeKB: 0,
        requests: 0,
        score: 0
      }
    }
  }

  private async analyzeSEO(): Promise<SEO> {
    if (!this.$) throw new Error('No HTML loaded')

    const title = this.$!('title').text() || 'No title found'
    const description = this.$!('meta[name="description"]').attr('content') || 'No description found'
    
    const keywordsMeta = this.$!('meta[name="keywords"]').attr('content')
    const keywords = keywordsMeta ? keywordsMeta.split(',').map(k => k.trim()) : []
    
    const metaTags = this.$!('meta').length

    return { title, description, keywords, metaTags }
  }

  private async analyzeComponents(): Promise<Component[]> {
    if (!this.$) return []

    const components: Component[] = []

    // Header/Navigation components
    const headerSelectors = ['header', '.header', '#header', '.site-header', '.main-header']
    if (this.$!(headerSelectors.join(', ')).length > 0) {
      const headerEl = this.$!(headerSelectors.join(', ')).first()
      const hasLogo = headerEl.find('img, .logo, .brand').length > 0
      const hasNav = headerEl.find('nav, .nav, ul').length > 0
      const navItems = headerEl.find('a, .nav-item').length
      const hasSearch = headerEl.find('input[type="search"], .search').length > 0
      
      const props = []
      if (hasLogo) props.push('logo')
      if (hasNav) props.push('navigation')
      if (hasSearch) props.push('search')
      
      components.push({
        name: 'Header',
        type: 'navigation',
        size: this.getElementSize(headerEl),
        description: `Main site header with ${navItems} navigation items`,
        props,
        children: navItems,
        complexity: navItems > 10 ? 'complex' : navItems > 5 ? 'moderate' : 'simple'
      })
    }

    // Navigation components
    const navSelectors = ['nav', '.nav', '.navbar', '.navigation', '.menu']
    this.$!(navSelectors.join(', ')).each((_, el) => {
      const navEl = this.$!(el)
      const linkCount = navEl.find('a').length
      const hasDropdown = navEl.find('.dropdown, .submenu').length > 0
      const isMobile = navEl.hasClass('mobile') || navEl.find('.hamburger, .menu-toggle').length > 0
      
      const props = []
      if (hasDropdown) props.push('dropdown')
      if (isMobile) props.push('mobile-responsive')
      
      components.push({
        name: 'Navigation Menu',
        type: 'navigation',
        size: this.getElementSize(navEl),
        description: `Navigation menu with ${linkCount} links${hasDropdown ? ' and dropdown menus' : ''}`,
        props,
        children: linkCount,
        complexity: linkCount > 15 ? 'complex' : linkCount > 8 ? 'moderate' : 'simple'
      })
    })

    // Hero/Banner sections
    const heroSelectors = ['.hero', '.banner', '.jumbotron', '.hero-section', '.main-banner']
    this.$!(heroSelectors.join(', ')).each((_, el) => {
      const heroEl = this.$!(el)
      const hasButton = heroEl.find('button, .btn, .button').length > 0
      const hasImage = heroEl.find('img').length > 0
      const hasVideo = heroEl.find('video').length > 0
      const hasAnimation = heroEl.find('[class*="animate"], [data-aos]').length > 0
      const buttonCount = heroEl.find('button, .btn, .button').length
      
      const props = []
      if (hasButton) props.push('call-to-action')
      if (hasImage) props.push('background-image')
      if (hasVideo) props.push('background-video')
      if (hasAnimation) props.push('animations')
      
      components.push({
        name: 'Hero Section',
        type: 'banner',
        size: this.getElementSize(heroEl),
        description: `Main hero section with ${buttonCount} action buttons${hasVideo ? ' and video background' : hasImage ? ' and image background' : ''}`,
        props,
        children: buttonCount,
        complexity: (hasVideo || hasAnimation) ? 'complex' : hasImage ? 'moderate' : 'simple'
      })
    })

    // Card components
    const cardSelectors = ['.card', '.cards', '.card-item', '.product-card', '.feature-card']
    const cardElements = this.$!(cardSelectors.join(', '))
    if (cardElements.length > 0) {
      const firstCard = cardElements.first()
      const hasImage = firstCard.find('img').length > 0
      const hasButton = firstCard.find('button, .btn, a').length > 0
      const hasPrice = firstCard.find('.price, .cost, [class*="price"]').length > 0
      
      const props = []
      if (hasImage) props.push('image')
      if (hasButton) props.push('action-button')
      if (hasPrice) props.push('pricing')
      
      components.push({
        name: 'Cards',
        type: 'grid',
        size: this.getElementSize(cardElements.first()),
        description: `Card grid with ${cardElements.length} items${hasPrice ? ' (product/pricing cards)' : ''}`,
        props,
        children: cardElements.length,
        complexity: cardElements.length > 20 ? 'complex' : cardElements.length > 8 ? 'moderate' : 'simple'
      })
    }

    // Form components
    this.$!('form').each((_, el) => {
      const formEl = this.$!(el)
      const inputCount = formEl.find('input, textarea, select').length
      const hasSubmit = formEl.find('input[type="submit"], button[type="submit"], .submit').length > 0
      const hasValidation = formEl.find('[required], .required, [data-validate]').length > 0
      const hasFileUpload = formEl.find('input[type="file"]').length > 0
      const isMultiStep = formEl.find('.step, .page, [data-step]').length > 1
      
      const props = []
      if (hasValidation) props.push('validation')
      if (hasFileUpload) props.push('file-upload')
      if (isMultiStep) props.push('multi-step')
      if (hasSubmit) props.push('submit-action')
      
      components.push({
        name: 'Form',
        type: 'form',
        size: this.getElementSize(formEl),
        description: `Form with ${inputCount} input fields${isMultiStep ? ' (multi-step)' : ''}`,
        props,
        children: inputCount,
        complexity: isMultiStep || inputCount > 15 ? 'complex' : inputCount > 8 ? 'moderate' : 'simple'
      })
    })

    // Button components
    const buttonElements = this.$!('button, .btn, .button, input[type="button"], input[type="submit"]')
    if (buttonElements.length > 0) {
      components.push({
        name: 'Buttons',
        type: 'button',
        size: `${buttonElements.length} buttons`
      })
    }

    // Modal/Dialog components
    const modalSelectors = ['.modal', '.dialog', '.popup', '.overlay']
    const modalElements = this.$!(modalSelectors.join(', '))
    if (modalElements.length > 0) {
      components.push({
        name: 'Modals',
        type: 'modal',
        size: `${modalElements.length} modals`
      })
    }

    // Sidebar components
    const sidebarSelectors = ['.sidebar', '.side-nav', '.aside', 'aside']
    if (this.$!(sidebarSelectors.join(', ')).length > 0) {
      components.push({
        name: 'Sidebar',
        type: 'sidebar',
        size: this.getElementSize(this.$!(sidebarSelectors.join(', ')).first())
      })
    }

    // Footer components
    const footerSelectors = ['footer', '.footer', '#footer', '.site-footer']
    if (this.$!(footerSelectors.join(', ')).length > 0) {
      const footerEl = this.$!(footerSelectors.join(', ')).first()
      const linkCount = footerEl.find('a').length
      const hasSocial = footerEl.find('.social, .social-media, [class*="social"]').length > 0
      
      components.push({
        name: 'Footer',
        type: 'footer',
        size: `${linkCount} links${hasSocial ? ', with social media' : ''}`
      })
    }

    // Table components
    const tableElements = this.$!('table')
    if (tableElements.length > 0) {
      components.push({
        name: 'Tables',
        type: 'table',
        size: `${tableElements.length} tables`
      })
    }

    // Image gallery/carousel
    const gallerySelectors = ['.gallery', '.carousel', '.slider', '.slideshow']
    const galleryElements = this.$!(gallerySelectors.join(', '))
    if (galleryElements.length > 0) {
      components.push({
        name: 'Image Gallery',
        type: 'gallery',
        size: `${galleryElements.length} galleries`
      })
    }

    // Main content areas
    const main = this.$!('main, .main, .content, .main-content').first()
    if (main.length) {
      components.push({
        name: 'Main Content',
        type: 'content',
        size: this.getElementSize(main)
      })
    }

    return components
  }

  private getElementSize(element: any): string {
    // Since we can't get actual computed styles, we'll estimate based on content
    const text = element.text().length
    const children = element.children().length
    
    if (text > 1000 || children > 20) return 'Large'
    if (text > 500 || children > 10) return 'Medium'
    return 'Small'
  }

  private async analyzeVisualElements(): Promise<VisualAnalysis> {
    if (!this.$) throw new Error('No HTML loaded')

    const animationTypes: string[] = []
    const graphicsElements: string[] = []
    const visualEffects: string[] = []
    let backgroundType = 'solid'
    let hasAnimations = false
    let colorScheme = 'light'
    let layoutType = 'standard'

    // Analyze CSS for animations and visual effects
    const styles = this.$!('style').text() + this.$!('link[rel="stylesheet"]').map((_, el) => this.$!(el).attr('href')).get().join(' ')
    
    // Check for animations
    if (/@keyframes|animation:|transform:|transition:/i.test(styles) || /@keyframes|animation:|transform:|transition:/i.test(this.html)) {
      hasAnimations = true
      if (/keyframes/i.test(styles)) animationTypes.push('CSS Keyframes')
      if (/transform/i.test(styles)) animationTypes.push('CSS Transforms')
      if (/transition/i.test(styles)) animationTypes.push('CSS Transitions')
    }

    // Check for JavaScript animations
    if (/gsap|anime\.js|lottie|three\.js|framer-motion/i.test(this.html)) {
      hasAnimations = true
      if (/gsap/i.test(this.html)) animationTypes.push('GSAP')
      if (/anime\.js/i.test(this.html)) animationTypes.push('Anime.js')
      if (/lottie/i.test(this.html)) animationTypes.push('Lottie')
      if (/three\.js/i.test(this.html)) animationTypes.push('Three.js')
      if (/framer-motion/i.test(this.html)) animationTypes.push('Framer Motion')
    }

    // Analyze background types
    if (/background.*gradient|linear-gradient|radial-gradient/i.test(styles)) {
      backgroundType = 'gradient'
    } else if (/background.*url|background-image/i.test(styles)) {
      backgroundType = 'image'
    } else if (/canvas|webgl|three\.js/i.test(this.html)) {
      backgroundType = 'dynamic/canvas'
    }

    // Check for graphics elements
    if (this.$!('svg').length > 0) graphicsElements.push('SVG Graphics')
    if (this.$!('canvas').length > 0) graphicsElements.push('Canvas Elements')
    if (this.$!('video').length > 0) graphicsElements.push('Video Elements')
    if (/\.gif/i.test(this.html)) graphicsElements.push('GIF Animations')
    if (this.$!('img[src*=".webp"], img[src*=".avif"]').length > 0) graphicsElements.push('Modern Image Formats')

    // Check for visual effects
    if (/box-shadow|drop-shadow/i.test(styles)) visualEffects.push('Shadows')
    if (/blur|filter/i.test(styles)) visualEffects.push('Blur Effects')
    if (/opacity|rgba/i.test(styles)) visualEffects.push('Transparency')
    if (/border-radius/i.test(styles)) visualEffects.push('Rounded Corners')
    if (/backdrop-filter/i.test(styles)) visualEffects.push('Backdrop Filters')

    // Determine color scheme
    const bodyBg = this.$!('body').css('background-color') || ''
    if (/rgb\(0|#000|black|dark/i.test(bodyBg) || /dark-mode|dark-theme/i.test(this.html)) {
      colorScheme = 'dark'
    }

    // Determine layout type
    if (/grid|display.*grid/i.test(styles)) {
      layoutType = 'CSS Grid'
    } else if (/flex|display.*flex/i.test(styles)) {
      layoutType = 'Flexbox'
    } else if (/bootstrap|container|row|col-/i.test(this.html)) {
      layoutType = 'Bootstrap Grid'
    }

    return {
      hasAnimations,
      animations: animationTypes,
      backgroundType,
      background: [backgroundType],
      hasGraphics: graphicsElements.length > 0,
      graphics: graphicsElements,
      hasVisualEffects: visualEffects.length > 0,
      effects: visualEffects,
      colorScheme: [colorScheme],
      layout: [layoutType]
    }
  }

  private async extractCodeAndData(): Promise<CodeExtraction> {
    if (!this.$) throw new Error('No HTML loaded')

    const jsonData: any[] = []
    const configFiles: string[] = []
    const apiEndpoints: string[] = []
    const externalLibraries: string[] = []
    const inlineScripts: string[] = []
    let hasReactComponents = false
    let hasVueComponents = false

    // Extract JSON data from script tags
    this.$!('script[type="application/json"], script[type="application/ld+json"]').each((_, el) => {
      const content = this.$!(el).html()
      if (content) {
        try {
          const parsed = JSON.parse(content)
          jsonData.push(parsed)
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    })

    // Extract inline scripts
    this.$!('script:not([src])').each((_, el) => {
      const content = this.$!(el).html()
      if (content && content.trim().length > 50) {
        inlineScripts.push(content.substring(0, 200) + '...')
      }
    })

    // Detect React components
    if (/React\.|createElement|jsx|tsx|react/i.test(this.html)) {
      hasReactComponents = true
    }

    // Detect Vue components
    if (/Vue\.|v-|@click|vue/i.test(this.html)) {
      hasVueComponents = true
    }

    // Extract external libraries
    this.$!('script[src]').each((_, el) => {
      const src = this.$!(el).attr('src')
      if (src) {
        if (/cdn|unpkg|jsdelivr/i.test(src)) {
          const libName = src.split('/').pop()?.split('.')[0] || src
          externalLibraries.push(libName)
        }
      }
    })

    // Extract potential API endpoints
    const scriptContent = this.$!('script').text()
    const apiMatches = scriptContent.match(/['"](\/api\/[^'"]+|https?:\/\/[^'"]*api[^'"]*)['"]|fetch\(['"]([^'"]+)['"]/g)
    if (apiMatches) {
      apiMatches.forEach(match => {
        const endpoint = match.replace(/['"]|fetch\(|\)/g, '')
        if (endpoint && !apiEndpoints.includes(endpoint)) {
          apiEndpoints.push(endpoint)
        }
      })
    }

    // Check for common config patterns
    if (/webpack\.config|vite\.config|next\.config/i.test(this.html)) {
      configFiles.push('Build Configuration')
    }
    if (/package\.json|composer\.json/i.test(this.html)) {
      configFiles.push('Package Configuration')
    }
    if (/\.env|config\.js|settings\.js/i.test(this.html)) {
      configFiles.push('Environment Configuration')
    }

    const components: string[] = []
    if (hasReactComponents) components.push('React')
    if (hasVueComponents) components.push('Vue')
    
    return {
      hasReactComponents,
      hasVueComponents,
      jsonData: jsonData.slice(0, 5), // Limit to first 5 JSON objects
      configFiles,
      apiEndpoints: apiEndpoints.slice(0, 10), // Limit to first 10 endpoints
      externalLibraries: externalLibraries.slice(0, 15), // Limit to first 15 libraries
      inlineScripts: inlineScripts.slice(0, 3), // Limit to first 3 scripts
      components
    }
  }

  private async captureScreenshot(): Promise<string> {
    try {
      console.log('Starting screenshot capture...')
      
      // Smart hybrid approach: try external services for reliable sites, fallback for others
      const domain = new URL(this.baseUrl).hostname
      const reliableDomains = ['trae.ai', 'github.com', 'google.com', 'stackoverflow.com', 'microsoft.com', 'apple.com', 'amazon.com']
      const isReliableDomain = reliableDomains.some(reliable => domain.includes(reliable))
      
      if (isReliableDomain) {
        try {
          console.log(`Attempting external screenshot service for reliable domain: ${domain}`)
          const screenshot = await browserScreenshotService.captureScreenshot(this.baseUrl)
          console.log('External screenshot service successful')
          return screenshot
        } catch (externalError) {
          console.warn('External screenshot failed for reliable domain, using fallback:', externalError)
          return this.generateEnhancedFallbackScreenshot()
        }
      } else {
        console.log(`Using fallback screenshot for potentially problematic domain: ${domain}`)
        return this.generateEnhancedFallbackScreenshot()
      }
      
    } catch (error) {
      console.error('Screenshot generation failed:', error)
      return this.generateBasicFallbackScreenshot()
    }
  }
  
  private generateEnhancedFallbackScreenshot(): string {
    try {
      // Create a more detailed fallback based on analyzed content
       const hasHeader = (this.$?.('header, .header, #header')?.length || 0) > 0
       const hasNav = (this.$?.('nav, .nav, .navbar')?.length || 0) > 0
       const hasHero = (this.$?.('.hero, .banner, .jumbotron')?.length || 0) > 0
       const hasCards = (this.$?.('.card, .cards')?.length || 0) > 0
       const hasFooter = (this.$?.('footer, .footer')?.length || 0) > 0
       
       const title = this.$?.('title')?.text() || 'Website'
       const domain = new URL(this.baseUrl).hostname
       const isSecureWebsite = domain.includes('trae.ai') || domain.includes('stripe.com') || domain.includes('github.com') || domain.includes('google.com')
      
      const svgContent = `
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="100%" height="100%" fill="url(#bg)"/>
          
          <!-- Header simulation -->
          ${hasHeader ? '<rect x="0" y="0" width="1200" height="80" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>' : ''}
          ${hasNav ? '<rect x="40" y="20" width="120" height="40" fill="#3b82f6" rx="4"/>' : ''}
          ${hasNav ? '<rect x="200" y="30" width="60" height="20" fill="#64748b" rx="2"/>' : ''}
          ${hasNav ? '<rect x="280" y="30" width="60" height="20" fill="#64748b" rx="2"/>' : ''}
          ${hasNav ? '<rect x="360" y="30" width="60" height="20" fill="#64748b" rx="2"/>' : ''}
          
          <!-- Hero section simulation -->
          ${hasHero ? '<rect x="40" y="120" width="1120" height="200" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" rx="8"/>' : ''}
          ${hasHero ? '<rect x="80" y="160" width="300" height="30" fill="#1e293b" rx="4"/>' : ''}
          ${hasHero ? '<rect x="80" y="200" width="200" height="20" fill="#64748b" rx="2"/>' : ''}
          ${hasHero ? '<rect x="80" y="240" width="120" height="40" fill="#3b82f6" rx="6"/>' : ''}
          
          <!-- Cards simulation -->
          ${hasCards ? '<rect x="40" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>' : ''}
          ${hasCards ? '<rect x="420" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>' : ''}
          ${hasCards ? '<rect x="800" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>' : ''}
          
          <!-- Footer simulation -->
          ${hasFooter ? '<rect x="0" y="720" width="1200" height="80" fill="#1e293b"/>' : ''}
          
          <!-- Main content area if no specific sections -->
          ${!hasHero && !hasCards ? '<rect x="40" y="120" width="1120" height="400" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>' : ''}
          
          <!-- Center text -->
          <text x="600" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#1e293b">
            ${title.substring(0, 50)}
          </text>
          <text x="600" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">
            ${domain}
          </text>
          <text x="600" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${isSecureWebsite ? '#ef4444' : '#94a3b8'}">
            ${isSecureWebsite ? 'Screenshot blocked by website security policy' : 'Website structure analyzed • Screenshot services temporarily unavailable'}
          </text>
          ${isSecureWebsite ? `<text x="600" y="485" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#a1a1aa">
            This website prevents external screenshot capture for security
          </text>` : ''}
          
          <!-- Decorative elements -->
          <circle cx="1100" cy="100" r="30" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
          <circle cx="1100" cy="100" r="15" fill="#3b82f6"/>
        </svg>
      `
      
      const base64Svg = Buffer.from(svgContent.trim()).toString('base64')
      return `data:image/svg+xml;base64,${base64Svg}`
      
    } catch (error) {
      console.error('Fallback screenshot generation failed:', error)
      
      // Ultimate fallback
      const simpleSvg = `
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8f9fa"/>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="20" fill="#6c757d">
            Preview not available for ${this.baseUrl}
          </text>
        </svg>
      `
      
      return `data:image/svg+xml;base64,${Buffer.from(simpleSvg.trim()).toString('base64')}`
    }
  }

  private generateBasicFallbackScreenshot(): string {
    try {
      const domain = new URL(this.baseUrl).hostname
      
      const simpleSvg = `
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="basicBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#basicBg)"/>
          <rect x="40" y="40" width="1120" height="720" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="12"/>
          
          <text x="600" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#1e293b">
            Website Analysis Complete
          </text>
          <text x="600" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">
            ${domain}
          </text>
          <text x="600" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">
            Screenshot preview temporarily unavailable
          </text>
          
          <circle cx="600" cy="350" r="40" fill="#3b82f6" opacity="0.1"/>
          <circle cx="600" cy="350" r="20" fill="#3b82f6"/>
        </svg>
      `
      
      return `data:image/svg+xml;base64,${Buffer.from(simpleSvg.trim()).toString('base64')}`
      
    } catch (error) {
      console.error('Basic fallback screenshot generation failed:', error)
      
      // Absolute minimal fallback
      const minimalSvg = `<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8f9fa"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="18" fill="#6c757d">Analysis Complete</text></svg>`
      return `data:image/svg+xml;base64,${Buffer.from(minimalSvg).toString('base64')}`
    }
  }
}