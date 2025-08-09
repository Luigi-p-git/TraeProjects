import axios from 'axios'
import html2canvas from 'html2canvas'

export class BrowserScreenshotService {
  private static instance: BrowserScreenshotService | null = null

  static getInstance(): BrowserScreenshotService {
    if (!BrowserScreenshotService.instance) {
      BrowserScreenshotService.instance = new BrowserScreenshotService()
    }
    return BrowserScreenshotService.instance
  }

  async captureScreenshot(url: string): Promise<string> {
    try {
      console.log(`Capturing screenshot for: ${url}`)
      
      // Try multiple screenshot services with better error handling
      const screenshotServices = [
        {
          name: 'ScreenshotAPI',
          url: `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}&width=1200&height=800&output=image&file_type=png&wait_for_event=load`,
          timeout: 15000
        },
        {
          name: 'ScreenshotMachine',
          url: `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&dimension=1200x800&format=png&cacheLimit=0`,
          timeout: 12000
        },
        {
          name: 'Thum.io',
          url: `https://image.thum.io/get/width/1200/crop/800/noanimate/${encodeURIComponent(url)}`,
          timeout: 10000
        },
        {
          name: 'PagePeeker',
          url: `https://free.pagepeeker.com/v2/thumbs.php?size=l&url=${encodeURIComponent(url)}`,
          timeout: 8000
        }
      ]
      
      // Try each service
      for (const service of screenshotServices) {
        try {
          console.log(`Trying ${service.name} screenshot service...`)
          
          const response = await axios.get(service.url, {
            timeout: service.timeout,
            responseType: 'arraybuffer',
            validateStatus: (status) => status === 200,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          })
          
          if (response.data && response.data.byteLength > 1000) {
            const base64 = Buffer.from(response.data).toString('base64')
            console.log(`${service.name} screenshot captured successfully`)
            return `data:image/png;base64,${base64}`
          }
        } catch (error: any) {
          console.warn(`${service.name} failed:`, error.message)
          continue
        }
      }
      
      // If all external services fail, try to capture using iframe + html2canvas
      console.log('External services failed, trying iframe capture...')
      return await this.captureWithIframe(url)
      
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      return this.generateFallbackScreenshot(url)
    }
  }

  private async captureWithIframe(url: string): Promise<string> {
    return new Promise((resolve) => {
      try {
        // Create a hidden iframe to load the website
        const iframe = document.createElement('iframe')
        iframe.src = url
        iframe.style.position = 'absolute'
        iframe.style.left = '-9999px'
        iframe.style.width = '1200px'
        iframe.style.height = '800px'
        iframe.style.border = 'none'
        
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe)
          resolve(this.generateFallbackScreenshot(url))
        }, 10000)
        
        iframe.onload = async () => {
          try {
            clearTimeout(timeout)
            
            // Wait a bit for content to render
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Try to capture the iframe content
            const canvas = await html2canvas(iframe.contentDocument?.body || iframe, {
              width: 1200,
              height: 800,
              useCORS: true,
              allowTaint: true
            })
            
            const dataUrl = canvas.toDataURL('image/png')
            document.body.removeChild(iframe)
            console.log('Iframe screenshot captured successfully')
            resolve(dataUrl)
            
          } catch (canvasError) {
            console.warn('html2canvas failed:', canvasError)
            document.body.removeChild(iframe)
            resolve(this.generateFallbackScreenshot(url))
          }
        }
        
        iframe.onerror = () => {
          clearTimeout(timeout)
          document.body.removeChild(iframe)
          resolve(this.generateFallbackScreenshot(url))
        }
        
        document.body.appendChild(iframe)
        
      } catch (error) {
        console.error('Iframe capture setup failed:', error)
        resolve(this.generateFallbackScreenshot(url))
      }
    })
  }

  private generateFallbackScreenshot(url: string): string {
    try {
      const domain = new URL(url).hostname
      const isSecureWebsite = domain.includes('trae.ai') || domain.includes('stripe.com') || domain.includes('github.com') || domain.includes('google.com')
      
      const svgContent = `
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.3"/>
            </pattern>
          </defs>
          
          <!-- Background -->
          <rect width="100%" height="100%" fill="url(#bg)"/>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          
          <!-- Header simulation -->
          <rect x="0" y="0" width="1200" height="80" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
          <rect x="40" y="20" width="120" height="40" fill="#3b82f6" rx="4"/>
          <rect x="200" y="30" width="60" height="20" fill="#64748b" rx="2"/>
          <rect x="280" y="30" width="60" height="20" fill="#64748b" rx="2"/>
          <rect x="360" y="30" width="60" height="20" fill="#64748b" rx="2"/>
          
          <!-- Hero section simulation -->
          <rect x="40" y="120" width="1120" height="200" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" rx="8"/>
          <rect x="80" y="160" width="400" height="30" fill="#1e293b" rx="4"/>
          <rect x="80" y="200" width="300" height="20" fill="#64748b" rx="2"/>
          <rect x="80" y="240" width="120" height="40" fill="#3b82f6" rx="6"/>
          
          <!-- Content cards simulation -->
          <rect x="40" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
          <rect x="420" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
          <rect x="800" y="360" width="360" height="200" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
          
          <!-- Footer simulation -->
          <rect x="0" y="720" width="1200" height="80" fill="#1e293b"/>
          
          <!-- Center content -->
          <circle cx="600" cy="380" r="50" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="600" cy="380" r="25" fill="${isSecureWebsite ? '#ef4444' : '#3b82f6'}"/>
          
          <!-- Text content -->
          <text x="600" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#1e293b">
            ${domain}
          </text>
          <text x="600" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">
            ${isSecureWebsite ? 'Screenshot blocked by security policy' : 'Screenshot not available'}
          </text>
          <text x="600" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">
            ${isSecureWebsite ? 'This website prevents external screenshot capture' : 'Try using the screenshot options above'}
          </text>
          <text x="600" y="545" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#a1a1aa">
            Analysis data is still available below
          </text>
          
          <!-- Warning icon for secure websites -->
          ${isSecureWebsite ? `
          <path d="M580 365 L580 355 Q580 350 585 350 L615 350 Q620 350 620 355 L620 365 M590 370 L610 370 M595 375 L605 375 M598 380 L602 380" 
                stroke="#ffffff" stroke-width="2" fill="none"/>
          ` : ''}
          
          <!-- Decorative elements -->
          <circle cx="1100" cy="100" r="30" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
          <circle cx="1100" cy="100" r="15" fill="${isSecureWebsite ? '#ef4444' : '#10b981'}"/>
          
          <circle cx="100" cy="700" r="20" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
          <circle cx="100" cy="700" r="10" fill="#f59e0b"/>
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
            Preview not available for ${url}
          </text>
        </svg>
      `
      
      return `data:image/svg+xml;base64,${Buffer.from(simpleSvg.trim()).toString('base64')}`
    }
  }

  // Method to capture current page screenshot using html2canvas
  async captureCurrentPage(): Promise<string> {
    try {
      console.log('Capturing current page screenshot...')
      
      const canvas = await html2canvas(document.body, {
        width: 1200,
        height: 800,
        useCORS: true,
        allowTaint: true
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Current page screenshot captured successfully')
      return dataUrl
      
    } catch (error) {
      console.error('Current page screenshot failed:', error)
      return this.generateFallbackScreenshot(window.location.href)
    }
  }
}

// Export singleton instance
export const browserScreenshotService = BrowserScreenshotService.getInstance()