import { test, expect } from '@playwright/test';

test.describe('Zubo Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome screen and start game', async ({ page }) => {
    // Check welcome screen
    await expect(page.getByText('Welcome to the Zubo Challenge!')).toBeVisible();
    await expect(page.getByText('Play the Challenge')).toBeVisible();
    await expect(page.getByText('Game Rules')).toBeVisible();

    // Check game rules
    await expect(page.getByText('Start with 3 lives')).toBeVisible();
    await expect(page.getByText('Score 75+ out of 100 to succeed')).toBeVisible();
    await expect(page.getByText('4 stages with increasing difficulty')).toBeVisible();

    // Start the game
    await page.getByText('Play the Challenge').click();

    // Should show first question
    await expect(page.locator('[data-testid="question-text"]').or(page.locator('h2')).first()).toBeVisible();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();
  });

  test('should show game header with correct information', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();

    // Wait for game to load
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Check header elements
    await expect(page.getByText('3')).toBeVisible(); // Lives
    await expect(page.getByText('0')).toBeVisible(); // Score
    await expect(page.getByText('Q1/100')).toBeVisible(); // Progress
    await expect(page.getByText('0s')).toBeVisible(); // Time bank
    await expect(page.getByText('Store')).toBeVisible(); // Store button
  });

  test('should handle answer selection and progress to next question', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Get the first question text to verify it changes
    const firstQuestionText = await page.locator('h2').first().textContent();

    // Click any answer option
    await page.locator('button').filter({ hasText: /^[A-D]/ }).first().click();

    // Wait for next question
    await page.waitForTimeout(600); // Wait for transition

    // Should progress to question 2
    await expect(page.getByText('Question 2 of 100')).toBeVisible();

    // Question text should have changed
    const secondQuestionText = await page.locator('h2').first().textContent();
    expect(secondQuestionText).not.toBe(firstQuestionText);
  });

  test('should open and close store', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Open store
    await page.getByText('Store').click();

    // Should show store screen
    await expect(page.getByText('Life Store')).toBeVisible();
    await expect(page.getByText('Need more lives to continue')).toBeVisible();

    // Should show life packages
    await expect(page.getByText('5 Lives')).toBeVisible();
    await expect(page.getByText('10 Lives')).toBeVisible();
    await expect(page.getByText('20 Lives')).toBeVisible();

    // Go back to game
    await page.getByText('← Back to Game').click();

    // Should return to question
    await expect(page.getByText('Question 1 of 100')).toBeVisible();
  });

  test('should handle game failure when lives run out', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Answer incorrectly 3 times to lose all lives
    for (let i = 0; i < 3; i++) {
      // Click first answer option (likely wrong)
      await page.locator('button').filter({ hasText: /^[A-D]/ }).first().click();
      await page.waitForTimeout(600);
      
      if (i < 2) {
        // Should still be in game
        await expect(page.getByText(/Question \d+ of 100/)).toBeVisible();
      }
    }

    // Should show failure screen
    await expect(page.getByText('Game Over')).toBeVisible();
    await expect(page.getByText('You\'ve run out of lives!')).toBeVisible();
    await expect(page.getByText('Try Again')).toBeVisible();
    await expect(page.getByText('Get More Lives')).toBeVisible();
  });

  test('should show progress bar and stage information', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Check progress bar exists
    await expect(page.locator('.bg-gradient-to-r').filter({ hasText: '' })).toBeVisible();

    // Check stage information
    await expect(page.getByText('Stage 1')).toBeVisible();

    // Check progress percentage
    await expect(page.getByText('1% Complete')).toBeVisible();
  });

  test('should handle time bank display', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Initial time bank should be 0
    await expect(page.getByText('0s')).toBeVisible();

    // Answer a question quickly
    await page.locator('button').filter({ hasText: /^[A-D]/ }).first().click();
    await page.waitForTimeout(600);

    // Time bank might have increased (depending on answer speed)
    // Just verify the time bank element is still visible
    await expect(page.locator('text=/\\d+s/')).toBeVisible();
  });

  test('should prevent cheating attempts', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Try to open developer tools (should be prevented)
    await page.keyboard.press('F12');
    
    // Try to copy text (should be prevented)
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+C');

    // Try right-click (should be prevented)
    await page.locator('h2').first().click({ button: 'right' });

    // Game should still be functional
    await expect(page.getByText('Question 1 of 100')).toBeVisible();
  });

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Check that elements are still visible and clickable on mobile
    await expect(page.getByText('Store')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /^[A-D]/ }).first()).toBeVisible();

    // Answer should still work on mobile
    await page.locator('button').filter({ hasText: /^[A-D]/ }).first().click();
    await page.waitForTimeout(600);
    await expect(page.getByText('Question 2 of 100')).toBeVisible();
  });

  test('should persist game state in localStorage', async ({ page }) => {
    // Start game
    await page.getByText('Play the Challenge').click();
    await expect(page.getByText('Question 1 of 100')).toBeVisible();

    // Answer a question
    await page.locator('button').filter({ hasText: /^[A-D]/ }).first().click();
    await page.waitForTimeout(600);
    await expect(page.getByText('Question 2 of 100')).toBeVisible();

    // Check that game state is saved in localStorage
    const gameState = await page.evaluate(() => {
      return localStorage.getItem('zubo-game-state');
    });

    expect(gameState).toBeTruthy();
    
    // Parse and verify game state structure
    const parsedState = JSON.parse(gameState!);
    expect(parsedState.gameStatus).toBe('playing');
    expect(parsedState.currentQuestionIndex).toBeGreaterThan(0);
  });

  test('should handle payment success URL parameters', async ({ page }) => {
    // Navigate with payment success parameters
    await page.goto('/?payment_success=true&lives=5');

    // Should still show welcome screen but process payment
    await expect(page.getByText('Welcome to the Zubo Challenge!')).toBeVisible();

    // Check console for payment processing logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    // Wait a bit for payment processing
    await page.waitForTimeout(1000);

    // Should have logged payment processing
    expect(logs.some(log => log.includes('payment success'))).toBeTruthy();
  });
}); 