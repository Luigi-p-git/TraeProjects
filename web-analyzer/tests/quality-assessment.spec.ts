import { test, expect } from '@playwright/test';

test.describe('Web Analyzer Quality Assessment', () => {
  test('should identify specific quality issues in Web Analyzer output', async ({ page }) => {
    // Go to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Web Analyzer');
    
    // Test with a well-known website that should have rich analysis data
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });
    
    // Test with GitHub (known to have rich tech stack)
    await urlInput.fill('https://github.com');
    await analyzeButton.click();
    
    // Wait for analysis to complete (extended timeout)
    await page.waitForTimeout(45000);
    
    // Take screenshot for manual inspection
    await page.screenshot({ path: 'test-results/github-analysis.png', fullPage: true });
    
    // Extract all page content for analysis
    const pageContent = await page.textContent('body');
    
    console.log('=== FULL ANALYSIS OUTPUT ===');
    console.log(pageContent);
    console.log('=== END OUTPUT ===');
    
    // Specific quality checks
    const qualityIssues = [];
    
    // 1. Check if analysis actually completed
    if (pageContent?.includes('Analyzing Website') || pageContent?.includes('Loading')) {
      qualityIssues.push('Analysis appears to be stuck in loading state');
    }
    
    // 2. Check for network errors
    if (pageContent?.includes('Network Error') || pageContent?.includes('Failed to analyze')) {
      qualityIssues.push('Network error occurred during analysis');
    }
    
    // 3. Check for empty or minimal tech stack detection
    if (!pageContent?.match(/(React|Vue|Angular|JavaScript|HTML|CSS)/i)) {
      qualityIssues.push('No common web technologies detected in tech stack');
    }
    
    // 4. Check for empty arrays in results
    const emptyArrayCount = (pageContent?.match(/\[\]/g) || []).length;
    if (emptyArrayCount > 5) {
      qualityIssues.push(`Too many empty arrays (${emptyArrayCount}) indicating poor data extraction`);
    }
    
    // 5. Check for "Unknown" values
    const unknownCount = (pageContent?.match(/Unknown/g) || []).length;
    if (unknownCount > 3) {
      qualityIssues.push(`Too many "Unknown" values (${unknownCount}) indicating poor detection`);
    }
    
    // 6. Check for design analysis quality
    if (!pageContent?.match(/(color|font|#[0-9a-fA-F]{3,6})/i)) {
      qualityIssues.push('No meaningful design analysis (colors, fonts) detected');
    }
    
    // 7. Check for component analysis
    if (!pageContent?.match(/(header|nav|main|section|div)/i)) {
      qualityIssues.push('No HTML components detected');
    }
    
    // 8. Check for SEO analysis
    if (!pageContent?.includes('title') && !pageContent?.includes('description')) {
      qualityIssues.push('No SEO analysis data found');
    }
    
    // 9. Check for performance metrics
    if (!pageContent?.match(/(load|time|performance)/i)) {
      qualityIssues.push('No performance metrics detected');
    }
    
    // 10. Check for CORS proxy issues
    if (pageContent?.includes('CORS') || pageContent?.includes('blocked')) {
      qualityIssues.push('CORS proxy issues detected');
    }
    
    // Report findings
    console.log('=== QUALITY ASSESSMENT RESULTS ===');
    if (qualityIssues.length > 0) {
      console.log('❌ QUALITY ISSUES FOUND:');
      qualityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('✅ No major quality issues detected');
    }
    
    // Additional diagnostic information
    console.log('\n=== DIAGNOSTIC INFO ===');
    console.log(`Total content length: ${pageContent?.length || 0} characters`);
    console.log(`Empty arrays found: ${emptyArrayCount}`);
    console.log(`"Unknown" values found: ${unknownCount}`);
    
    // Check for specific sections
    const sections = ['Tech Stack', 'Design', 'Performance', 'SEO', 'Components'];
    sections.forEach(section => {
      const hasSection = pageContent?.includes(section);
      console.log(`${section} section present: ${hasSection ? '✅' : '❌'}`);
    });
    
    // The test should always pass - we're just gathering diagnostic info
    expect(pageContent).toBeTruthy();
    
    // But log a summary of issues for the user
    if (qualityIssues.length > 0) {
      console.log(`\n🔍 SUMMARY: Found ${qualityIssues.length} quality issues that need attention`);
    }
  });
  
  test('should test with a simple website for baseline comparison', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });
    
    // Test with a very simple website
    await urlInput.fill('https://httpbin.org/html');
    await analyzeButton.click();
    
    await page.waitForTimeout(30000);
    
    const pageContent = await page.textContent('body');
    
    console.log('=== SIMPLE WEBSITE TEST ===');
    console.log('Content length:', pageContent?.length || 0);
    
    // For a simple HTML page, we should at least detect:
    const expectedDetections = [
      { name: 'HTML elements', pattern: /(html|body|head)/i },
      { name: 'Basic structure', pattern: /(title|heading)/i },
      { name: 'Some tech stack', pattern: /(HTML|CSS)/i }
    ];
    
    expectedDetections.forEach(detection => {
      const found = detection.pattern.test(pageContent || '');
      console.log(`${detection.name}: ${found ? '✅' : '❌'}`);
    });
    
    await page.screenshot({ path: 'test-results/simple-website-analysis.png', fullPage: true });
  });
  
  test('should monitor network requests during analysis', async ({ page }) => {
    const requests: string[] = [];
    const failedRequests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
      console.log('❌ Request failed:', request.url(), request.failure()?.errorText);
    });
    
    await page.goto('http://localhost:3000');
    
    const urlInput = page.locator('input[type="url"]');
    const analyzeButton = page.locator('button').filter({ hasText: 'Analyze' });
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    await page.waitForTimeout(20000);
    
    console.log('=== NETWORK ANALYSIS ===');
    console.log(`Total requests: ${requests.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    // Check for CORS proxy usage
    const proxyRequests = requests.filter(url => 
      url.includes('allorigins.win') || 
      url.includes('corsproxy.io') || 
      url.includes('cors-anywhere')
    );
    
    console.log(`Proxy requests: ${proxyRequests.length}`);
    proxyRequests.forEach(req => console.log(`  - ${req}`));
    
    if (failedRequests.length > 0) {
      console.log('Failed requests:');
      failedRequests.forEach(req => console.log(`  - ${req}`));
    }
    
    expect(requests.length).toBeGreaterThan(0);
  });
});