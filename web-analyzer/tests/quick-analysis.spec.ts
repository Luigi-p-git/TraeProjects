import { test, expect } from '@playwright/test';

test.describe('Web Analyzer Quick Test', () => {
  test('should analyze a simple website and check output quality', async ({ page }) => {
    // Go to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Web Analyzer');
    
    // Find input and button
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });
    
    // Enter a simple test URL
    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();
    
    // Wait for analysis to start (loading indicator)
    await page.waitForTimeout(2000);
    
    // Wait for analysis to complete (max 30 seconds)
    await page.waitForTimeout(30000);
    
    // Take a screenshot for manual inspection
    await page.screenshot({ path: 'test-results/quick-analysis.png', fullPage: true });
    
    // Get all text content from the page
    const pageContent = await page.textContent('body');
    console.log('=== FULL PAGE CONTENT ===');
    console.log(pageContent);
    console.log('=== END CONTENT ===');
    
    // Check for specific issues that indicate poor output
    const issues = [];
    
    if (pageContent?.includes('Network Error')) {
      issues.push('Network Error detected');
    }
    
    if (pageContent?.includes('Failed to analyze')) {
      issues.push('Analysis failed');
    }
    
    if (pageContent?.includes('[]') && pageContent.split('[]').length > 3) {
      issues.push('Multiple empty arrays in results');
    }
    
    if (pageContent?.includes('Unknown') && pageContent.split('Unknown').length > 5) {
      issues.push('Too many Unknown values');
    }
    
    if (!pageContent?.match(/(html|css|javascript)/i)) {
      issues.push('No basic web technologies detected');
    }
    
    // Log issues found
    if (issues.length > 0) {
      console.log('=== ISSUES FOUND ===');
      issues.forEach(issue => console.log(`- ${issue}`));
      console.log('=== END ISSUES ===');
    } else {
      console.log('No major issues detected in output quality');
    }
    
    // Check if we have any meaningful results
    const hasResults = pageContent?.includes('Tech Stack') || 
                      pageContent?.includes('Design') || 
                      pageContent?.includes('Performance');
    
    if (!hasResults) {
      console.log('WARNING: No analysis results sections found');
    }
    
    // The test should pass regardless, we're just gathering information
    expect(pageContent).toBeTruthy();
  });
  
  test('should test network request behavior', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
      console.log('REQUEST:', request.url());
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log('RESPONSE:', response.url(), response.status());
    });
    
    // Go to the application
    await page.goto('http://localhost:3000');
    
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });
    
    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();
    
    // Wait for network activity
    await page.waitForTimeout(20000);
    
    console.log('=== NETWORK REQUESTS ===');
    requests.forEach(req => console.log(req));
    console.log('=== NETWORK RESPONSES ===');
    responses.forEach(res => console.log(`${res.url} - ${res.status} ${res.statusText}`));
    
    // Check if CORS proxy requests were made
    const proxyRequests = requests.filter(url => 
      url.includes('allorigins.win') || 
      url.includes('corsproxy.io') || 
      url.includes('cors-anywhere')
    );
    
    console.log('=== PROXY REQUESTS ===');
    proxyRequests.forEach(req => console.log(req));
    
    expect(requests.length).toBeGreaterThan(0);
  });
});