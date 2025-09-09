import { test, expect } from '@playwright/test';

test.describe('Pomodoro Timer - Advanced Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should complete a full work session cycle', async ({ page }) => {
		// This test would be slow with real 25-minute timer,
		// so we're testing the UI behavior rather than waiting for completion

		// Start a work session
		await page.getByRole('button', { name: 'Start' }).click();
		await expect(page.getByText('Running')).toBeVisible();
		await expect(page.getByText('Work Session')).toBeVisible();

		// Verify progress circle is working
		const progressCircle = page.locator('svg circle').nth(1);
		const initialStrokeDashOffset = await progressCircle.getAttribute('stroke-dashoffset');

		// Wait a few seconds
		await page.waitForTimeout(3000);

		// Progress should have changed
		const newStrokeDashOffset = await progressCircle.getAttribute('stroke-dashoffset');
		expect(parseFloat(newStrokeDashOffset!)).not.toBe(parseFloat(initialStrokeDashOffset!));
	});

	test('should switch sessions properly after manual session change', async ({ page }) => {
		// Start in work session
		await expect(page.getByText('Work Session')).toBeVisible();
		await expect(page.getByText('25:00')).toBeVisible();

		// Switch to short break manually
		await page.getByRole('button', { name: 'Short Break' }).click();
		await expect(page.getByText('Short Break')).toBeVisible();
		await expect(page.getByText('05:00')).toBeVisible();

		// Start the short break timer
		await page.getByRole('button', { name: 'Start' }).click();
		await page.waitForTimeout(1100);
		await expect(page.getByText('04:59')).toBeVisible();

		// Switch to long break while running (should pause)
		await page.getByRole('button', { name: 'Long Break' }).click();
		await expect(page.getByText('Long Break')).toBeVisible();
		await expect(page.getByText('15:00')).toBeVisible();
		await expect(page.getByText('Paused')).toBeVisible();
	});

	test('should maintain session counter correctly', async ({ page }) => {
		// Initial state - 0 sessions
		await expect(page.getByText('Sessions completed:')).toBeVisible();

		const sessionCounter = page.locator('span.bg-red-100.text-red-800');
		await expect(sessionCounter).toHaveText('0');

		// The counter would increment after completing actual sessions
		// Since we can't wait 25 minutes, we test that the counter element exists
		// and has the correct styling
		await expect(sessionCounter).toHaveClass(/bg-red-100.*text-red-800.*px-2.*py-1.*rounded-full/);
	});

	test('should handle rapid button clicking gracefully', async ({ page }) => {
		const startButton = page.getByRole('button', { name: 'Start' });
		const pauseButton = page.getByRole('button', { name: 'Pause' });
		const resetButton = page.getByRole('button', { name: 'Reset' });

		// Rapid start/pause clicking
		await startButton.click();
		await pauseButton.click();
		await startButton.click();
		await pauseButton.click();

		// Should end up in paused state
		await expect(page.getByText('Paused')).toBeVisible();
		await expect(startButton).toBeVisible();

		// Reset should work after rapid clicking
		await resetButton.click();
		await expect(page.getByText('25:00')).toBeVisible();
	});

	test('should handle session switching during timer run', async ({ page }) => {
		// Start work timer
		await page.getByRole('button', { name: 'Start' }).click();
		await page.waitForTimeout(2100);

		// Verify time has progressed
		await expect(page.getByText('24:58')).toBeVisible();
		await expect(page.getByText('Running')).toBeVisible();

		// Switch to break session (should pause and reset)
		await page.getByRole('button', { name: 'Short Break' }).click();

		// Should be paused and reset to break duration
		await expect(page.getByText('Paused')).toBeVisible();
		await expect(page.getByText('05:00')).toBeVisible();
		await expect(page.getByText('Short Break')).toBeVisible();
	});

	test('should display correct time format', async ({ page }) => {
		// Test various time formats
		await expect(page.getByText('25:00')).toBeVisible(); // Work session

		await page.getByRole('button', { name: 'Short Break' }).click();
		await expect(page.getByText('05:00')).toBeVisible(); // Short break

		await page.getByRole('button', { name: 'Long Break' }).click();
		await expect(page.getByText('15:00')).toBeVisible(); // Long break

		// Start timer to test running format
		await page.getByRole('button', { name: 'Start' }).click();
		await page.waitForTimeout(1100);

		// Should show format like 14:59
		const timeRegex = /^(1[0-5]|[0-9]):([0-5][0-9])$/;
		const timeElement = page.locator('.font-mono').first();
		const timeText = await timeElement.textContent();
		expect(timeText).toMatch(timeRegex);
	});

	test('should have proper visual feedback for interactions', async ({ page }) => {
		const startButton = page.getByRole('button', { name: 'Start' });

		// Check button has hover effects (we can check classes are present)
		await expect(startButton).toHaveClass(/hover:bg-red-600.*transform.*hover:scale-105/);

		// Check session buttons have proper styling
		const workButton = page.getByRole('button', { name: 'Work' });
		const shortBreakButton = page.getByRole('button', { name: 'Short Break' });
		const longBreakButton = page.getByRole('button', { name: 'Long Break' });

		// Work should be active initially
		await expect(workButton).toHaveClass(/bg-red-100.*text-red-800/);
		await expect(shortBreakButton).toHaveClass(/bg-gray-100.*text-gray-700/);
		await expect(longBreakButton).toHaveClass(/bg-gray-100.*text-gray-700/);

		// Switch to short break
		await shortBreakButton.click();
		await expect(shortBreakButton).toHaveClass(/bg-green-100.*text-green-800/);
		await expect(workButton).toHaveClass(/bg-gray-100.*text-gray-700/);
	});

	test('should handle edge cases gracefully', async ({ page }) => {
		// Test reset when timer is not running
		await page.getByRole('button', { name: 'Reset' }).click();
		await expect(page.getByText('25:00')).toBeVisible();
		await expect(page.getByText('Paused')).toBeVisible();

		// Test starting from different sessions
		await page.getByRole('button', { name: 'Short Break' }).click();
		await page.getByRole('button', { name: 'Start' }).click();
		await expect(page.getByText('Running')).toBeVisible();

		await page.getByRole('button', { name: 'Reset' }).click();
		await expect(page.getByText('05:00')).toBeVisible(); // Should reset to short break duration
	});

	test('should maintain accessibility during state changes', async ({ page }) => {
		// Check initial accessibility
		const startButton = page.getByRole('button', { name: 'Start' });
		await expect(startButton).toBeVisible();
		await expect(startButton).toBeEnabled();

		// Start timer
		await startButton.click();

		// Pause button should be accessible
		const pauseButton = page.getByRole('button', { name: 'Pause' });
		await expect(pauseButton).toBeVisible();
		await expect(pauseButton).toBeEnabled();

		// All session buttons should remain accessible
		await expect(page.getByRole('button', { name: 'Work' })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Short Break' })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Long Break' })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Reset' })).toBeEnabled();
	});
});
