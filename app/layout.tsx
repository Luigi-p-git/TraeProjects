import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubsTracker Pro - Futuristic Subscription Management',
  description: 'Advanced subscription tracking with AI-powered insights and futuristic design',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          {/* Header */}
          <header className="glass-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">
                      SubsTracker Pro
                    </h1>
                    <p className="text-xs text-white/60">Futuristic Management</p>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="#" className="text-white/80 hover:text-cyan-400 transition-all duration-300 relative group">
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#" className="text-white/80 hover:text-cyan-400 transition-all duration-300 relative group">
                    Analytics
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#" className="text-white/80 hover:text-cyan-400 transition-all duration-300 relative group">
                    Insights
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#" className="text-white/80 hover:text-cyan-400 transition-all duration-300 relative group">
                    Settings
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </nav>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">U</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative z-10 container mx-auto px-6 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="glass-card border-t border-white/10 mt-20 relative z-10">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <div className="flex justify-center items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="gradient-text font-semibold">SubsTracker Pro</span>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Advanced subscription management with AI-powered insights
                </p>
                <div className="flex justify-center space-x-6 text-xs text-white/40">
                  <span>Built with Next.js 14</span>
                  <span>•</span>
                  <span>Powered by AI</span>
                  <span>•</span>
                  <span>Futuristic Design</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}