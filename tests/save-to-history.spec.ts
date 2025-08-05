import { test, expect } from '@playwright/test';

test.describe('VoicePal Save to History', () => {
  // Test Speech-to-Text mode
  test('should save transcribed text to history in speech-to-text mode', async ({ page }) => {
    await page.goto('http://localhost:1420');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Ensure we're in speech-to-text mode (should be default)
    // Look for the microphone button and click it to start "recording"
    const micButton = page.locator('[data-testid="mic-button"]');
    await micButton.waitFor({ state: 'visible', timeout: 5000 });
    await micButton.click();
    
    // Wait for the dummy transcription to appear ("Hello world")
    await page.waitForTimeout(1500); // Wait a bit longer than the 1000ms timeout in the hook
    
    // Verify the transcribed text appears
    const transcribedText = page.locator('text="Hello world"');
    await expect(transcribedText).toBeVisible({ timeout: 2000 });
    
    // Click the Save button
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();
    
    // Verify the item appears in the sidebar history
    const historyItem = page.locator('[data-testid="history-item"], .history-item').first();
    await expect(historyItem).toBeVisible({ timeout: 5000 });
    
    // Verify the content is saved correctly
    await expect(historyItem).toContainText('Hello world');
  });

  // Test Text-to-Speech mode
  test('should save text input to history in text-to-speech mode', async ({ page }) => {
    await page.goto('http://localhost:1420');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Switch to text-to-speech mode
    const modeToggle = page.locator('button:has-text("Text-to-Speech"), [data-testid="mode-toggle"]');
    if (await modeToggle.isVisible()) {
      await modeToggle.click();
    }
    
    // Look for text input textarea
    const textInput = page.locator('textarea[placeholder*="Enter text to convert"]');
    await textInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Fill in some sample text
    await textInput.fill('This is a test text for speech synthesis.');
    
    // Click the Save button
    const saveButton = page.locator('button:has-text("Save"), [data-testid="save-button"]');
    await saveButton.click();
    
    // Verify the item appears in the sidebar history
    const historyItem = page.locator('[data-testid="history-item"], .history-item').first();
    await expect(historyItem).toBeVisible({ timeout: 5000 });
    
    // Verify the content is saved correctly
    await expect(historyItem).toContainText('This is a test text for speech synthesis.');
  });

  test('should not allow saving empty transcription', async ({ page }) => {
    // Navigate to the VoicePal application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find the Save button
    const saveButton = page.locator('button:has-text("Save"), [data-testid="save-button"]');
    
    // The Save button should be disabled when there's no transcribed text
    await expect(saveButton).toBeDisabled();
  });

  test('should display "No saved transcriptions" when history is empty', async ({ page }) => {
    // Navigate to the VoicePal application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Clear localStorage to ensure empty history
    await page.evaluate(() => {
      localStorage.removeItem('voicepal-history');
      window.location.reload();
    });
    
    // Wait for reload
    await page.waitForLoadState('networkidle');
    
    // Check for empty state message
    const emptyMessage = page.locator('text="No saved transcriptions", [data-testid="empty-history"]');
    await expect(emptyMessage).toBeVisible();
  });
});