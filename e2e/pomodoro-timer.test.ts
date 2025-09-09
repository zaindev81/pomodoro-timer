import { test, expect } from '@playwright/test';

test.describe('Pomodoro Timer E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display initial state correctly', async ({ page }) => {
		// Check page title
		await expect(page).toHaveTitle('Pomodoro Timer');

		// Check main heading
		await expect(page.getByRole('heading', { name: 'Pomodoro Timer' })).toBeVisible();

		// Check initial timer display (25:00 for work session)
		await expect(page.getByText('25:00')).toBeVisible();

		// Check initial session label
		await expect(page.getByText('Work Session')).toBeVisible();

		// Check initial status
		await expect(page.getByText('Paused')).toBeVisible();

		// Check initial session counter
		await expect(page.getByText('Sessions completed:')).toBeVisible();
		await expect(page.getByText('0')).toBeVisible();

		// Check control buttons
		await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

		// Check session switching buttons
		await expect(page.getByRole('button', { name: 'Work' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Short Break' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Long Break' })).toBeVisible();

		// Check Pomodoro Technique info
		await expect(page.getByText('Pomodoro Technique')).toBeVisible();
		await expect(page.getByText('Work for 25 minutes, then take a 5-minute break')).toBeVisible();
	});

	test('should switch between session types', async ({ page }) => {
		// Switch to Short Break
		await page.getByRole('button', { name: 'Short Break' }).click();
		await expect(page.getByText('Short Break')).toBeVisible();
		await expect(page.getByText('05:00')).toBeVisible();

		// Switch to Long Break
		await page.getByRole('button', { name: 'Long Break' }).click();
		await expect(page.getByText('Long Break')).toBeVisible();
		await expect(page.getByText('15:00')).toBeVisible();

		// Switch back to Work
		await page.getByRole('button', { name: 'Work' }).click();
		await expect(page.getByText('Work Session')).toBeVisible();
		await expect(page.getByText('25:00')).toBeVisible();
	});

	test('should start and pause timer', async ({ page }) => {
		const startButton = page.getByRole('button', { name: 'Start' });
		const pauseButton = page.getByRole('button', { name: 'Pause' });

		// Start the timer
		await startButton.click();

		// Should show "Running" status
		await expect(page.getByText('Running')).toBeVisible();

		// Button should change to "Pause"
		await expect(pauseButton).toBeVisible();

		// Wait a moment and check if time decreases
		await page.waitForTimeout(1100);
		await expect(page.getByText('24:59')).toBeVisible();

		// Pause the timer
		await pauseButton.click();

		// Should show "Paused" status
		await expect(page.getByText('Paused')).toBeVisible();

		// Button should change back to "Start"
		await expect(startButton).toBeVisible();

		// Time should stop decreasing
		const currentTime = await page.getByText('24:59');
		await expect(currentTime).toBeVisible();
		await page.waitForTimeout(1100);
		await expect(currentTime).toBeVisible(); // Should still be the same
	});

	test('should reset timer', async ({ page }) => {
		const startButton = page.getByRole('button', { name: 'Start' });
		const resetButton = page.getByRole('button', { name: 'Reset' });

		// Start timer and wait for it to decrease
		await startButton.click();
		await page.waitForTimeout(2100);

		// Verify time has decreased
		await expect(page.getByText('24:58')).toBeVisible();

		// Reset the timer
		await resetButton.click();

		// Should return to initial state
		await expect(page.getByText('25:00')).toBeVisible();
		await expect(page.getByText('Paused')).toBeVisible();
		await expect(startButton).toBeVisible();
	});

	test('should update page title when timer is running', async ({ page }) => {
		const startButton = page.getByRole('button', { name: 'Start' });

		// Initial title
		await expect(page).toHaveTitle('Pomodoro Timer');

		// Start timer
		await startButton.click();
		await page.waitForTimeout(1100);

		// Title should update with countdown
		await expect(page).toHaveTitle(/24:59 - Work Session - Pomodoro Timer/);
	});

	test('should have visual progress indicator', async ({ page }) => {
		// Check that progress circle exists
		const progressCircle = page.locator('svg circle').nth(1); // Second circle is the progress one
		await expect(progressCircle).toBeVisible();

		// Start timer and check progress changes
		await page.getByRole('button', { name: 'Start' }).click();
		await page.waitForTimeout(1100);

		// Progress circle should have updated stroke-dashoffset
		const strokeDashOffset = await progressCircle.getAttribute('stroke-dashoffset');
		expect(parseFloat(strokeDashOffset!)).toBeLessThan(283); // Full circle is 283
	});

	test('should show correct colors for different sessions', async ({ page }) => {
		// Work session should have red color
		const workProgressCircle = page.locator('svg circle[stroke="#ef4444"]');
		await expect(workProgressCircle).toBeVisible();

		// Switch to short break - should have green color
		await page.getByRole('button', { name: 'Short Break' }).click();
		const breakProgressCircle = page.locator('svg circle[stroke="#10b981"]');
		await expect(breakProgressCircle).toBeVisible();
	});

	test('should highlight active session button', async ({ page }) => {
		// Work button should be highlighted initially
		const workButton = page.getByRole('button', { name: 'Work' });
		await expect(workButton).toHaveClass(/bg-red-100.*text-red-800.*border-red-200/);

		// Switch to Short Break
		await page.getByRole('button', { name: 'Short Break' }).click();
		const shortBreakButton = page.getByRole('button', { name: 'Short Break' });
		await expect(shortBreakButton).toHaveClass(/bg-green-100.*text-green-800.*border-green-200/);

		// Work button should no longer be highlighted
		await expect(workButton).toHaveClass(/bg-gray-100.*text-gray-700/);
	});

	test('should have responsive design', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// All main elements should still be visible
		await expect(page.getByRole('heading', { name: 'Pomodoro Timer' })).toBeVisible();
		await expect(page.getByText('25:00')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

		// Session buttons should be in grid layout
		const sessionButtons = page.locator('.grid.grid-cols-3');
		await expect(sessionButtons).toBeVisible();
	});

	test('should handle keyboard interactions', async ({ page }) => {
		// Focus start button with Tab
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		const startButton = page.getByRole('button', { name: 'Start' });
		await expect(startButton).toBeFocused();

		// Activate with Enter/Space
		await page.keyboard.press('Enter');
		await expect(page.getByText('Running')).toBeVisible();
	});

	test('should persist timer state during navigation', async ({ page }) => {
		// Start timer
		await page.getByRole('button', { name: 'Start' }).click();
		await page.waitForTimeout(2100);

		// Verify time has decreased
		await expect(page.getByText('24:58')).toBeVisible();

		// Refresh page (simulating navigation)
		await page.reload();

		// Timer should be reset to initial state (this is expected behavior)
		await expect(page.getByText('25:00')).toBeVisible();
		await expect(page.getByText('Paused')).toBeVisible();
	});

	test('should have proper semantic HTML structure', async ({ page }) => {
		// Check heading hierarchy
		const h1 = page.getByRole('heading', { level: 1 });
		const h2 = page.getByRole('heading', { level: 2 });
		const h3 = page.getByRole('heading', { level: 3 });

		await expect(h1).toHaveCount(1);
		await expect(h2).toHaveCount(1);
		await expect(h3).toHaveCount(1);

		// Check button accessibility
		const buttons = page.getByRole('button');
		const buttonCount = await buttons.count();
		expect(buttonCount).toBeGreaterThan(0);

		// Each button should have accessible text
		for (let i = 0; i < buttonCount; i++) {
			const button = buttons.nth(i);
			const text = await button.textContent();
			expect(text).toBeTruthy();
			expect(text!.trim().length).toBeGreaterThan(0);
		}
	});
});
