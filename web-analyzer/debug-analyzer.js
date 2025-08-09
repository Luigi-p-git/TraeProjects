// Simple debug script to test WebAnalyzer directly
import { WebAnalyzer } from './src/services/WebAnalyzer.ts';

async function testAnalyzer() {
  console.log('=== Testing WebAnalyzer Service ===');
  
  const analyzer = new WebAnalyzer();
  const testUrls = [
    'https://httpbin.org/html',
    'https://example.com',
    'https://github.com'
  ];
  
  for (const url of testUrls) {
    console.log(`\n--- Testing URL: ${url} ---`);
    
    try {
      const startTime = Date.now();
      const result = await analyzer.analyze(url);
      const endTime = Date.now();
      
      console.log(`Analysis completed in ${endTime - startTime}ms`);
      console.log('\n=== ANALYSIS RESULTS ===');
      console.log(JSON.stringify(result, null, 2));
      
      // Check for quality issues
      const issues = [];
      
      // Check tech stack
      if (!result.techStack || Object.keys(result.techStack).length === 0) {
        issues.push('Empty tech stack');
      } else {
        Object.entries(result.techStack).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length === 0) {
            issues.push(`Empty ${key} array in tech stack`);
          }
        });
      }
      
      // Check design
      if (!result.design || Object.keys(result.design).length === 0) {
        issues.push('Empty design analysis');
      }
      
      // Check performance
      if (!result.performance || Object.keys(result.performance).length === 0) {
        issues.push('Empty performance analysis');
      }
      
      // Check SEO
      if (!result.seo || Object.keys(result.seo).length === 0) {
        issues.push('Empty SEO analysis');
      }
      
      // Check components
      if (!result.components || result.components.length === 0) {
        issues.push('No components detected');
      }
      
      if (issues.length > 0) {
        console.log('\n=== QUALITY ISSUES FOUND ===');
        issues.forEach(issue => console.log(`- ${issue}`));
      } else {
        console.log('\n✅ No major quality issues detected');
      }
      
    } catch (error) {
      console.error(`\n❌ Analysis failed for ${url}:`, error.message);
      console.error('Error details:', error);
    }
  }
}

// Run the test
testAnalyzer().catch(console.error);