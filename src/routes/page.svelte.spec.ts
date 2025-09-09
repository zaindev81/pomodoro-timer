import { page } from '@vitest/browser/context';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

// Mock the Web Audio API
const mockAudioContext = {
	createOscillator: vi.fn().mockReturnValue({
		connect: vi.fn(),
		frequency: { value: 0 },
		type: '',
		start: vi.fn(),
		stop: vi.fn()
	}),
	createGain: vi.fn().mockReturnValue({
		connect: vi.fn(),
		gain: {
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn()
		}
	}),
	destination: {},
	currentTime: 0
};

describe('Pomodoro Timer (+page.svelte)', () => {
	beforeEach(() => {
		// Mock Audio API
		(window as any).AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
		(window as any).webkitAudioContext = vi.fn().mockImplementation(() => mockAudioContext);

		// Mock document.title
		Object.defineProperty(document, 'title', {
			writable: true,
			value: 'Test'
		});
	});

	it('should render the main heading', async () => {
		render(Page);

		const heading = page.getByRole('heading', { name: 'Pomodoro Timer' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should display initial timer state', async () => {
		render(Page);

		// Should show 25:00 initially (work session)
		const timerDisplay = page.getByText('25:00');
		await expect.element(timerDisplay).toBeInTheDocument();

		// Should show "Work Session" label
		const sessionLabel = page.getByText('Work Session');
		await expect.element(sessionLabel).toBeInTheDocument();

		// Should show "Paused" status
		const pausedStatus = page.getByText('Paused');
		await expect.element(pausedStatus).toBeInTheDocument();

		// Should show 0 completed sessions
		const completedSessions = page.getByText('0');
		await expect.element(completedSessions).toBeInTheDocument();
	});

	it('should have functional control buttons', async () => {
		render(Page);

		// Check Start button exists
		const startButton = page.getByRole('button', { name: 'Start' });
		await expect.element(startButton).toBeInTheDocument();

		// Check Reset button exists
		const resetButton = page.getByRole('button', { name: 'Reset' });
		await expect.element(resetButton).toBeInTheDocument();
	});

	it('should have session switching buttons', async () => {
		render(Page);

		// Check all session buttons exist
		const workButton = page.getByRole('button', { name: 'Work' });
		const shortBreakButton = page.getByRole('button', { name: 'Short Break' });
		const longBreakButton = page.getByRole('button', { name: 'Long Break' });

		await expect.element(workButton).toBeInTheDocument();
		await expect.element(shortBreakButton).toBeInTheDocument();
		await expect.element(longBreakButton).toBeInTheDocument();
	});

	it('should switch to short break session when button is clicked', async () => {
		render(Page);

		const shortBreakButton = page.getByRole('button', { name: 'Short Break' });
		await shortBreakButton.click();

		// Should show "Short Break" label
		const sessionLabel = page.getByText('Short Break');
		await expect.element(sessionLabel).toBeInTheDocument();

		// Should show 05:00 for short break
		const timerDisplay = page.getByText('05:00');
		await expect.element(timerDisplay).toBeInTheDocument();
	});

	it('should switch to long break session when button is clicked', async () => {
		render(Page);

		const longBreakButton = page.getByRole('button', { name: 'Long Break' });
		await longBreakButton.click();

		// Should show "Long Break" label
		const sessionLabel = page.getByText('Long Break');
		await expect.element(sessionLabel).toBeInTheDocument();

		// Should show 15:00 for long break
		const timerDisplay = page.getByText('15:00');
		await expect.element(timerDisplay).toBeInTheDocument();
	});

	it('should toggle start/pause button text', async () => {
		render(Page);

		const toggleButton = page.getByRole('button', { name: 'Start' });

		// Initially shows "Start"
		await expect.element(toggleButton).toHaveTextContent('Start');

		// Click to start timer
		await toggleButton.click();

		// Should now show "Pause"
		await expect.element(toggleButton).toHaveTextContent('Pause');
	});

	it('should display Pomodoro Technique information', async () => {
		render(Page);

		const techniqueHeading = page.getByText('Pomodoro Technique');
		const techniqueDescription = page.getByText(/Work for 25 minutes, then take a 5-minute break/);

		await expect.element(techniqueHeading).toBeInTheDocument();
		await expect.element(techniqueDescription).toBeInTheDocument();
	});

	it('should have proper page structure', async () => {
		render(Page);

		// Check main heading exists
		const mainHeading = page.getByRole('heading', { level: 1, name: 'Pomodoro Timer' });
		await expect.element(mainHeading).toBeInTheDocument();

		// Check session info heading exists
		const sessionHeading = page.getByRole('heading', { level: 2, name: 'Work Session' });
		await expect.element(sessionHeading).toBeInTheDocument();

		// Check technique info heading exists
		const techniqueHeading = page.getByRole('heading', { level: 3, name: 'Pomodoro Technique' });
		await expect.element(techniqueHeading).toBeInTheDocument();
	});
});
