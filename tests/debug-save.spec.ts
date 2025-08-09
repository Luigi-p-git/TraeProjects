import { test, expect } from '@playwright/test';

test.describe('Debug Save Functionality', () => {
  test('should capture console logs when saving', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
    
    // Click the microphone button
    const micButton = page.locator('[data-testid="mic-button"]');
    await expect(micButton).toBeEnabled();
    await micButton.click();
    
    // Wait for dummy text
    await page.waitForTimeout(2000);
    
    // Verify text appears
    await expect(page.locator('text=Hello world')).toBeVisible();
    
    // Click Save button
    const saveButton = page.locator('[data-testid="save-button"]');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    
    // Wait for save operation
    await page.waitForTimeout(2000);
    
    // Print all console logs
    console.log('=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    console.log('=== END LOGS ===');
    
    // Check if any history items exist
    const historyItems = page.locator('[data-testid="history-item"]');
    const count = await historyItems.count();
    console.log(`Found ${count} history items`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-save-screenshot.png', fullPage: true });
  });
});