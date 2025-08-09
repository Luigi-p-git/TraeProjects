import { AnalysisData, WebsiteRecreation } from '../types/analysis'

export class WebsiteRecreator {
  static recreateWebsite(data: AnalysisData): WebsiteRecreation {
    const framework = this.determineFramework(data)
    const html = this.generateHTML(data, framework)
    const css = this.generateCSS(data)
    const javascript = this.generateJavaScript(data, framework)
    const dependencies = this.generateDependencies(data, framework)
    const instructions = this.generateInstructions(data, framework)

    return {
      html,
      css,
      javascript,
      framework,
      dependencies,
      instructions
    }
  }

  private static determineFramework(data: AnalysisData): 'vanilla' | 'react' | 'vue' {
    const { techStack, codeExtraction } = data
    
    if (techStack.frontend.includes('React') || codeExtraction.components.includes('React')) {
      return 'react'
    }
    if (techStack.frontend.includes('Vue') || codeExtraction.components.includes('Vue')) {
      return 'vue'
    }
    return 'vanilla'
  }

  private static generateHTML(data: AnalysisData, framework: string): string {
    const { components, seo } = data
    
    if (framework === 'react') {
      return this.generateReactHTML(data)
    }
    if (framework === 'vue') {
      return this.generateVueHTML(data)
    }
    
    // Vanilla HTML with semantic structure
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title || 'Recreated Website'}</title>
  <meta name="description" content="${seo.description || 'Recreated website based on analysis'}">
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${data.design.fonts[0]?.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
`

    // Generate header with navigation if exists
    const navigationComponent = components.find(c => c.type === 'Header' || c.type === 'Navigation Menu')
    if (navigationComponent) {
      html += `  <header class="header" role="banner">
    <nav class="navigation" role="navigation" aria-label="Main navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <a href="/" class="brand-link">${seo.title?.split(' ')[0] || 'Brand'}</a>
        </div>
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
          <span class="hamburger"></span>
        </button>
        <ul class="nav-menu" role="menubar">
          <li role="none"><a href="#home" role="menuitem">Home</a></li>
          <li role="none"><a href="#about" role="menuitem">About</a></li>
          <li role="none"><a href="#services" role="menuitem">Services</a></li>
          <li role="none"><a href="#contact" role="menuitem">Contact</a></li>
        </ul>
      </div>
    </nav>
  </header>
`
    }

    // Generate main content
    html += `  <main class="main-content" role="main">
`
    
    // Generate components based on analysis
    components.forEach((component, index) => {
      if (component.type !== 'Header' && component.type !== 'Navigation Menu') {
        html += `    <section class="section section-${index + 1}" id="section-${index + 1}">
`
        html += `      <div class="container">
`
        html += this.generateComponentHTML(component)
        html += `      </div>
`
        html += `    </section>
`
      }
    })
    
    html += `  </main>
`
    
    // Generate footer
    html += `  <footer class="footer" role="contentinfo">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">${seo.title?.split(' ')[0] || 'Company'}</h3>
          <p class="footer-description">${seo.description || 'Building amazing digital experiences.'}</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact Info</h4>
          <p>Email: info@example.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 ${seo.title?.split(' ')[0] || 'Company'}. All rights reserved.</p>
      </div>
    </div>
  </footer>
`

    html += `
  <script src="script.js"></script>
</body>
</html>`
    
    return html
  }

  private static generateReactHTML(data: AnalysisData): string {
    const { seo } = data
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title || 'Recreated Website'}</title>
  <meta name="description" content="${seo.description || 'Recreated website based on analysis'}">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`
  }

  private static generateVueHTML(data: AnalysisData): string {
    const { seo } = data
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title || 'Recreated Website'}</title>
  <meta name="description" content="${seo.description || 'Recreated website based on analysis'}">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`
  }

  private static generateComponentHTML(component: any): string {
    switch (component.type) {
      case 'Header':
        return `
  <header class="header">
    <nav class="navigation">
      <div class="logo">Logo</div>
      <ul class="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>`
      
      case 'Hero Section':
        return `
  <section class="hero">
    <div class="hero-content">
      <h1>Welcome to Our Website</h1>
      <p>Discover amazing features and services</p>
      <button class="cta-button">Get Started</button>
    </div>
  </section>`
      
      case 'Navigation Menu':
        return `
  <nav class="main-nav">
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Products</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>`
      
      case 'Cards':
        return `
  <section class="cards-section">
    <div class="card">
      <h3>Feature 1</h3>
      <p>Description of feature 1</p>
    </div>
    <div class="card">
      <h3>Feature 2</h3>
      <p>Description of feature 2</p>
    </div>
    <div class="card">
      <h3>Feature 3</h3>
      <p>Description of feature 3</p>
    </div>
  </section>`
      
      case 'Form':
        return `
  <section class="form-section">
    <form class="contact-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" name="message" required></textarea>
      </div>
      <button type="submit">Submit</button>
    </form>
  </section>`
      
      default:
        return `
  <section class="${component.type.toLowerCase().replace(' ', '-')}">
    <h2>${component.type}</h2>
    <p>Content for ${component.type}</p>
  </section>`
    }
  }

  private static generateCSS(data: AnalysisData): string {
    const { design, visualAnalysis } = data
    
    let css = `/* Generated CSS based on website analysis */
/* Modern, responsive design with CSS Grid and Flexbox */

`
    
    // CSS Reset and custom properties
    css += `:root {
  /* Color Palette */
  --primary-color: ${design.colors[0] || '#2563eb'};
  --secondary-color: ${design.colors[1] || '#64748b'};
  --accent-color: ${design.colors[2] || '#f59e0b'};
  --background-color: ${design.colors[3] || '#ffffff'};
  --surface-color: ${design.colors[4] || '#f8fafc'};
  --text-primary: ${design.colors[5] || '#1e293b'};
  --text-secondary: ${design.colors[6] || '#64748b'};
  --border-color: ${design.colors[7] || '#e2e8f0'};
  
  /* Typography */
  --font-primary: '${design.fonts[0] || 'Inter'}', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-secondary: '${design.fonts[1] || design.fonts[0] || 'Inter'}', serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  
  /* Layout */
  --container-max-width: 1200px;
  --border-radius: 0.5rem;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

`
    
    css += `/* Reset and base styles */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

`
    
    // Typography
    css += `/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

p {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent-color);
}

`
    
    // Layout components
    css += `/* Layout Components */
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.section {
  padding: var(--spacing-3xl) 0;
}

.section:nth-child(even) {
  background-color: var(--surface-color);
}

`
    
    // Header and Navigation
    css += `/* Header & Navigation */
.header {
  background-color: var(--background-color);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-brand .brand-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: var(--spacing-xl);
}

.nav-menu a {
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.nav-menu a:hover {
  background-color: var(--surface-color);
}

.nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.hamburger {
  display: block;
  width: 1.5rem;
  height: 2px;
  background-color: var(--text-primary);
  position: relative;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  transition: transform 0.3s ease;
}

.hamburger::before { top: -6px; }
.hamburger::after { bottom: -6px; }

`
    
    // Hero section
    css += `/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  padding: var(--spacing-3xl) 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.placeholder-image {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: var(--spacing-3xl);
  text-align: center;
  font-size: 1.125rem;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

`
    
    // Buttons
    css += `/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius);
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--background-color);
  color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--surface-color);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: white;
  color: var(--primary-color);
}

`
    
    // Footer
    css += `/* Footer */
.footer {
  background-color: var(--text-primary);
  color: white;
  padding: var(--spacing-3xl) 0 var(--spacing-lg);
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.footer-title {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: var(--spacing-sm);
}

.footer-links a {
  color: #cbd5e1;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: var(--spacing-lg);
  text-align: center;
  color: #9ca3af;
}

`

    // Add component styles
    css += this.generateComponentCSS(data)
    
    // Add responsive design
    css += `/* Responsive Design */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .nav-menu {
    display: none;
  }
  
  .nav-toggle {
    display: block;
  }
  
  .hero {
    padding: var(--spacing-xl) 0;
    min-height: 50vh;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .section {
    padding: var(--spacing-xl) 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }
  
  .btn {
    width: 100%;
  }
}
`
    
    // Add animations if detected
    if (visualAnalysis.hasAnimations) {
      css += `/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}

.animate-slide-in {
  animation: slideInLeft 0.6s ease-out;
}

.animate-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.animate-item.animate-fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Enhanced hover effects */
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.btn {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.nav-menu a {
  transition: all 0.2s ease;
}

.nav-menu a:hover {
  transform: translateY(-1px);
}

/* Navigation States */
.header.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-menu.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

body.nav-open {
  overflow: hidden;
}

/* Notification System */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.notification-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.notification-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

/* Lazy Loading */
img.lazy {
  opacity: 0;
  transition: opacity 0.3s;
}

img:not(.lazy) {
  opacity: 1;
}

/* Scroll animations */
@media (prefers-reduced-motion: no-preference) {
  .section {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .section.in-view {
    opacity: 1;
    transform: translateY(0);
  }
}
`
    }

    return css
  }

  private static generateComponentCSS(data: AnalysisData): string {
    const { design } = data
    
    return `/* Header Styles */
.header {
  background-color: ${design.colors[1] || '#ffffff'};
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: ${design.colors[0] || '#333'};
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: ${design.colors[0] || '#333'};
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: ${design.colors[2] || '#007bff'};
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, ${design.colors[1] || '#f8f9fa'}, ${design.colors[2] || '#e9ecef'});
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${design.colors[0] || '#333'};
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: ${design.colors[0] || '#666'};
}

.cta-button {
  background-color: ${design.colors[2] || '#007bff'};
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: ${design.colors[3] || '#0056b3'};
}

/* Cards Section */
.cards-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: ${design.colors[1] || '#ffffff'};
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h3 {
  margin-bottom: 1rem;
  color: ${design.colors[0] || '#333'};
}

/* Form Styles */
.form-section {
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.contact-form {
  background-color: ${design.colors[1] || '#f8f9fa'};
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${design.colors[0] || '#333'};
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${design.colors[2] || '#ddd'};
  font-size: 1rem;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

button[type="submit"] {
  background-color: ${design.colors[2] || '#007bff'};
  color: white;
  padding: 1rem 2rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: ${design.colors[3] || '#0056b3'};
}

/* Responsive Design */
@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .cards-section {
    grid-template-columns: 1fr;
  }
}

`
  }

  private static generateJavaScript(data: AnalysisData, framework: string): string {
    if (framework === 'react') {
      return this.generateReactJS(data)
    }
    if (framework === 'vue') {
      return this.generateVueJS(data)
    }
    
    // Vanilla JavaScript with modern features
    let js = `// Generated JavaScript based on website analysis
// Modern, interactive functionality

`
    
    js += `class WebsiteController {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupSmoothScrolling();
    this.setupScrollAnimations();
    this.setupFormHandling();
    this.setupLazyLoading();
    console.log('🚀 Website recreated successfully!');
  }

`
    
    // Navigation functionality
    js += `  setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');

    // Mobile navigation toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
      });
    }

    // Header scroll effect
    if (header) {
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;
      });
    }
  }

`
    
    // Smooth scrolling
    js += `  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          const navMenu = document.querySelector('.nav-menu');
          if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
          }
        }
      });
    });
  }

`
    
    // Scroll animations
    if (data.visualAnalysis.hasAnimations) {
      js += `  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Add staggered animation delay
          const children = entry.target.querySelectorAll('.animate-item');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-fade-in');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    // Observe sections and cards
    document.querySelectorAll('.section, .card, .hero').forEach(element => {
      observer.observe(element);
    });
  }

`
    } else {
      js += `  setupScrollAnimations() {
    // No animations detected, skipping scroll animations
  }

`
    }
    
    // Form handling
    js += `  setupFormHandling() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    });
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', data);
      this.showNotification('Message sent successfully!', 'success');
      form.reset();
      
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }, 1500);
  }

`
    
    // Lazy loading
    js += `  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

`
    
    // Notification system
    js += `  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification notification-\${type}\`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

`
    
    // Initialize when DOM is ready
    js += `// Initialize the website controller
document.addEventListener('DOMContentLoaded', () => {
  new WebsiteController();
});

`
    
    // Add utility functions
    js += `// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
`
    
    return js
  }

  private static generateReactJS(data: AnalysisData): string {
    const { components } = data
    
    let reactCode = `import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={\`app \${isLoaded ? 'loaded' : ''}\`}>
`

    components.forEach(component => {
      reactCode += this.generateReactComponent(component)
    })

    reactCode += `    </div>
  )
}

`

    // Generate individual components
    components.forEach(component => {
      reactCode += this.generateReactComponentDefinition(component)
    })

    reactCode += `export default App`
    
    return reactCode
  }

  private static generateReactComponent(component: any): string {
    const componentName = component.type.replace(/\s+/g, '')
    return `      <${componentName} />\n`
  }

  private static generateReactComponentDefinition(component: any): string {
    const componentName = component.type.replace(/\s+/g, '')
    
    switch (component.type) {
      case 'Header':
        return `function Header() {
  return (
    <header className="header">
      <nav className="navigation">
        <div className="logo">Logo</div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
  )
}

`
      
      case 'Hero Section':
        return `function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to Our Website</h1>
        <p>Discover amazing features and services</p>
        <button className="cta-button">Get Started</button>
      </div>
    </section>
  )
}

`
      
      default:
        return `function ${componentName}() {
  return (
    <section className="${component.type.toLowerCase().replace(' ', '-')}">
      <h2>${component.type}</h2>
      <p>Content for ${component.type}</p>
    </section>
  )
}

`
    }
  }

  private static generateVueJS(_data: AnalysisData): string {
    return `import { createApp } from 'vue'
import './style.css'

const App = {
  data() {
    return {
      isLoaded: false
    }
  },
  mounted() {
    this.isLoaded = true
  },
  template: \`
    <div :class="['app', { loaded: isLoaded }]">
      <!-- Vue components would go here -->
      <h1>Vue.js Recreation</h1>
      <p>This is a Vue.js recreation of the analyzed website.</p>
    </div>
  \`
}

createApp(App).mount('#app')`
  }

  private static generateDependencies(data: AnalysisData, framework: string): string[] {
    const deps: string[] = []
    
    if (framework === 'react') {
      deps.push('react', 'react-dom')
    } else if (framework === 'vue') {
      deps.push('vue')
    }
    
    // Add detected external libraries
    data.codeExtraction.externalLibraries.forEach(lib => {
      if (lib.toLowerCase().includes('gsap')) deps.push('gsap')
      if (lib.toLowerCase().includes('anime')) deps.push('animejs')
      if (lib.toLowerCase().includes('three')) deps.push('three')
      if (lib.toLowerCase().includes('lottie')) deps.push('lottie-web')
    })
    
    return deps
  }

  private static generateInstructions(data: AnalysisData, framework: string): string {
    const dependencies = this.generateDependencies(data, framework)
    
    let instructions = `# Website Recreation Instructions\n\n`
    instructions += `This recreation is based on the analysis of: ${data.url}\n\n`
    instructions += `## Framework: ${framework.charAt(0).toUpperCase() + framework.slice(1)}\n\n`
    
    if (framework === 'vanilla') {
      instructions += `## Setup Instructions:\n`
      instructions += `1. Create a new folder for your project\n`
      instructions += `2. Save the HTML as 'index.html'\n`
      instructions += `3. Save the CSS as 'styles.css'\n`
      instructions += `4. Save the JavaScript as 'script.js'\n`
      instructions += `5. Open index.html in a web browser\n\n`
    } else if (framework === 'react') {
      instructions += `## Setup Instructions:\n`
      instructions += `1. Create a new React project: \`npx create-react-app recreated-website\`\n`
      instructions += `2. Replace src/App.js with the generated React code\n`
      instructions += `3. Replace src/App.css with the generated CSS\n`
      instructions += `4. Install dependencies: \`npm install ${dependencies.join(' ')}\`\n`
      instructions += `5. Run the project: \`npm start\`\n\n`
    } else if (framework === 'vue') {
      instructions += `## Setup Instructions:\n`
      instructions += `1. Create a new Vue project: \`npm create vue@latest recreated-website\`\n`
      instructions += `2. Replace src/App.vue with the generated Vue code\n`
      instructions += `3. Replace src/style.css with the generated CSS\n`
      instructions += `4. Install dependencies: \`npm install ${dependencies.join(' ')}\`\n`
      instructions += `5. Run the project: \`npm run dev\`\n\n`
    }
    
    instructions += `## Features Recreated:\n`
    data.components.forEach(component => {
      instructions += `- ${component.type}\n`
    })
    
    instructions += `\n## Design Elements:\n`
    instructions += `- Colors: ${data.design.colors.join(', ')}\n`
    instructions += `- Fonts: ${data.design.fonts.join(', ')}\n`
    instructions += `- Layout: ${data.visualAnalysis.layout.join(', ')}\n`
    
    if (data.visualAnalysis.hasAnimations) {
      instructions += `- Animations: ${data.visualAnalysis.animations.join(', ')}\n`
    }
    
    instructions += `\n## Notes:\n`
    instructions += `- This is a recreation based on analysis, not an exact copy\n`
    instructions += `- You may need to adjust content, images, and specific styling\n`
    instructions += `- Consider adding your own content and customizations\n`
    instructions += `- Test responsiveness on different screen sizes\n`
    
    return instructions
  }
}