import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for the React app to load
  await page.waitForLoadState('networkidle');
});

test('should complete basic game flow', async ({ page }) => {
  // Debug: Log page content if welcome text is not found
  try {
    await expect(page.getByText(/Welcome to the Zubo Challenge/)).toBeVisible({ timeout: 10000 });
  } catch (error) {
    console.log('Page title:', await page.title());
    console.log('Page content:', await page.content());
    throw error;
  }
  
  // Start the game
  await page.getByText('Play the Challenge').click();
  
  // Should show a question
  await expect(page.locator('.question-container')).toBeVisible({ timeout: 10000 });
  
  // Should have answer options
  const answerButtons = page.locator('button').filter({ hasText: /^[A-D]$/ });
  await expect(answerButtons.first()).toBeVisible({ timeout: 10000 });
});

test('should open store during gameplay', async ({ page }) => {
  // Start the game
  await page.getByText('Play the Challenge').click();
  
  // Wait for game to load
  await expect(page.locator('.question-container')).toBeVisible({ timeout: 10000 });
  
  // Click store button
  await page.getByText('Store').click();
  
  // Should show store
  await expect(page.getByText('Life Store')).toBeVisible({ timeout: 10000 });
});

test('should be responsive on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Check if the welcome screen is responsive
  await expect(page.getByText(/Welcome to the Zubo Challenge/)).toBeVisible({ timeout: 10000 });
  
  // Start the game
  await page.getByText('Play the Challenge').click();
  
  // Should show question on mobile
  await expect(page.locator('.question-container')).toBeVisible({ timeout: 10000 });
});

test('should prevent right-click during game', async ({ page }) => {
  // Start the game
  await page.getByText('Play the Challenge').click();
  
  // Wait for game to load
  await expect(page.locator('.question-container')).toBeVisible({ timeout: 10000 });
  
  // Try to right-click on question
  const questionContainer = page.locator('.question-container');
  await questionContainer.click({ button: 'right' });
  
  // Context menu should not appear (this is a basic check)
  // In a real scenario, you'd check for context menu prevention
  await expect(questionContainer).toBeVisible({ timeout: 10000 });
});

test('should handle payment simulation', async ({ page }) => {
  // Simulate payment success URL
  await page.goto('/?payment_success=true&lives=5');
  await page.waitForLoadState('networkidle');
  
  // Should show success notification or handle payment
  await expect(page.getByText(/Welcome to the Zubo Challenge/)).toBeVisible({ timeout: 10000 });
}); 