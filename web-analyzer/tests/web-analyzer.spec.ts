import { test, expect } from '@playwright/test';

test.describe('Web Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application correctly', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Web Analyzer');
    
    // Check if URL input is present
    await expect(page.locator('input[type="url"]')).toBeVisible();
    
    // Check if analyze button is present
    await expect(page.locator('button').filter({ hasText: 'Analyze' })).toBeVisible();
  });

  test('should validate URL input', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    // Test empty URL
    await analyzeButton.click();
    // Should show some validation or not proceed
    
    // Test invalid URL
    await urlInput.fill('invalid-url');
    await analyzeButton.click();
    // Should show validation error or handle gracefully
    
    // Test valid URL format
    await urlInput.fill('https://example.com');
    await expect(urlInput).toHaveValue('https://example.com');
  });

  test('should perform website analysis', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    // Enter a test URL (using a reliable test site)
    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();

    // Wait for loading animation to appear
    await expect(page.locator('.loading, [data-testid="loading"]')).toBeVisible({ timeout: 5000 });
    
    // Wait for analysis to complete (increase timeout for network requests)
    await page.waitForTimeout(15000);
    
    // Check if results are displayed
    const resultsContainer = page.locator('.results, [data-testid="results"]');
    await expect(resultsContainer).toBeVisible({ timeout: 30000 });
  });

  test('should display comprehensive analysis results', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    // Use a simple, reliable test site
    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();

    // Wait for analysis to complete
    await page.waitForTimeout(20000);

    // Check for different analysis sections
    const sections = [
      'Tech Stack',
      'Design',
      'Performance',
      'SEO',
      'Components'
    ];

    for (const section of sections) {
      const sectionElement = page.locator(`text=${section}`);
      await expect(sectionElement).toBeVisible({ timeout: 5000 });
    }

    // Check if tech stack information is meaningful
    const techStackSection = page.locator('text=Tech Stack').locator('..');
    const techStackContent = await techStackSection.textContent();
    
    // Validate that tech stack contains actual data, not just empty arrays
    expect(techStackContent).not.toContain('[]');
    expect(techStackContent).not.toContain('No data');
    
    // Check if design information is present
    const designSection = page.locator('text=Design').locator('..');
    const designContent = await designSection.textContent();
    
    // Validate design analysis contains meaningful data
    expect(designContent).toMatch(/(color|font|spacing|breakpoint)/i);
    
    // Check if components are detected
    const componentsSection = page.locator('text=Components').locator('..');
    const componentsContent = await componentsSection.textContent();
    
    // Should detect at least some basic HTML components
    expect(componentsContent).toMatch(/(header|body|html|div)/i);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    // Test with a non-existent domain
    await urlInput.fill('https://this-domain-does-not-exist-12345.com');
    await analyzeButton.click();

    // Wait for error handling
    await page.waitForTimeout(10000);

    // Should show an error message
    const errorMessage = page.locator('text=/error|failed|unable/i');
    await expect(errorMessage).toBeVisible({ timeout: 15000 });
  });

  test('should test with a real website', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    // Test with a real, simple website
    await urlInput.fill('https://example.com');
    await analyzeButton.click();

    // Wait for analysis to complete
    await page.waitForTimeout(25000);

    // Take a screenshot for manual inspection
    await page.screenshot({ path: 'test-results/analysis-results.png', fullPage: true });

    // Check if meaningful data is extracted
    const pageContent = await page.textContent('body');
    
    // Log the results for inspection
    console.log('Analysis Results Content:', pageContent);
    
    // Validate that we have actual analysis data
    expect(pageContent).toMatch(/(html|css|javascript)/i);
    expect(pageContent).not.toContain('Unknown');
    expect(pageContent).not.toContain('No data available');
  });

  test('should validate analysis data quality', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();

    // Wait for analysis
    await page.waitForTimeout(20000);

    // Extract all analysis data
    const analysisData = await page.evaluate(() => {
      const results = document.querySelector('[data-testid="results"], .results');
      return results ? results.textContent : document.body.textContent;
    });

    console.log('Full Analysis Data:', analysisData);

    // Check for common issues that indicate poor output quality
    const qualityIssues = [];
    
    if (analysisData?.includes('[]')) {
      qualityIssues.push('Empty arrays in results');
    }
    
    if (analysisData?.includes('Unknown') && analysisData.split('Unknown').length > 3) {
      qualityIssues.push('Too many "Unknown" values');
    }
    
    if (analysisData?.includes('No data')) {
      qualityIssues.push('"No data" messages present');
    }
    
    if (!analysisData?.match(/(html|css|javascript|react|vue|angular)/i)) {
      qualityIssues.push('No common web technologies detected');
    }
    
    if (qualityIssues.length > 0) {
      console.error('Quality Issues Found:', qualityIssues);
      throw new Error(`Poor output quality detected: ${qualityIssues.join(', ')}`);
    }
  });

  test('should test CORS proxy functionality', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(request.url());
    });

    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });

    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();

    // Wait for network requests
    await page.waitForTimeout(15000);

    // Check if CORS proxy requests were made
    const proxyRequests = requests.filter(url => 
      url.includes('allorigins.win') || 
      url.includes('corsproxy.io') || 
      url.includes('cors-anywhere')
    );

    console.log('Proxy requests made:', proxyRequests);
    expect(proxyRequests.length).toBeGreaterThan(0);
  });
});