<script>
	import { onMount, onDestroy } from 'svelte';

	// Timer states
	let timeLeft = 25 * 60; // 25 minutes in seconds
	let isRunning = false;
	let currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
	let completedSessions = 0;
	let interval = null;

	// Session durations (in seconds)
	const sessionDurations = {
		work: 25 * 60,
		shortBreak: 5 * 60,
		longBreak: 15 * 60
	};

	// Session labels
	const sessionLabels = {
		work: 'Work Session',
		shortBreak: 'Short Break',
		longBreak: 'Long Break'
	};

	// Format time display
	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Calculate progress percentage
	$: progress = ((sessionDurations[currentSession] - timeLeft) / sessionDurations[currentSession]) * 100;

	// Start/pause timer
	function toggleTimer() {
		if (isRunning) {
			pauseTimer();
		} else {
			startTimer();
		}
	}

	function startTimer() {
		if (!isRunning) {
			isRunning = true;
			interval = setInterval(() => {
				timeLeft--;
				if (timeLeft <= 0) {
					completeSession();
				}
			}, 1000);
		}
	}

	function pauseTimer() {
		isRunning = false;
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function resetTimer() {
		pauseTimer();
		timeLeft = sessionDurations[currentSession];
	}

	function completeSession() {
		pauseTimer();
		playNotificationSound();

		if (currentSession === 'work') {
			completedSessions++;
			// After 4 work sessions, take a long break
			if (completedSessions % 4 === 0) {
				currentSession = 'longBreak';
			} else {
				currentSession = 'shortBreak';
			}
		} else {
			// After any break, return to work
			currentSession = 'work';
		}

		timeLeft = sessionDurations[currentSession];
	}

	function switchSession(newSession) {
		pauseTimer();
		currentSession = newSession;
		timeLeft = sessionDurations[newSession];
	}

	function playNotificationSound() {
		// Create a simple beep sound
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = 800;
		oscillator.type = 'sine';

		gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 1);
	}

	// Cleanup on component destroy
	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	// Update document title with timer
	$: if (typeof document !== 'undefined') {
		document.title = isRunning
			? `${formatTime(timeLeft)} - ${sessionLabels[currentSession]} - Pomodoro Timer`
			: 'Pomodoro Timer';
	}
</script>

<svelte:head>
	<title>Pomodoro Timer</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-800 mb-2">Pomodoro Timer</h1>
			<p class="text-gray-600">Stay focused, take breaks, be productive</p>
		</div>

		<!-- Session Info -->
		<div class="text-center mb-6">
			<h2 class="text-xl font-semibold text-gray-700 mb-2">
				{sessionLabels[currentSession]}
			</h2>
			<div class="flex justify-center items-center space-x-2">
				<span class="text-sm text-gray-500">Sessions completed:</span>
				<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
					{completedSessions}
				</span>
			</div>
		</div>

		<!-- Timer Display -->
		<div class="relative mb-8">
			<!-- Progress Circle -->
			<div class="relative w-64 h-64 mx-auto">
				<svg class="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
					<!-- Background circle -->
					<circle
						cx="50"
						cy="50"
						r="45"
						fill="none"
						stroke="#fee2e2"
						stroke-width="8"
					/>
					<!-- Progress circle -->
					<circle
						cx="50"
						cy="50"
						r="45"
						fill="none"
						stroke={currentSession === 'work' ? '#ef4444' : '#10b981'}
						stroke-width="8"
						stroke-linecap="round"
						stroke-dasharray="283"
						stroke-dashoffset={283 - (283 * progress) / 100}
						class="transition-all duration-1000 ease-in-out"
					/>
				</svg>

				<!-- Timer Text -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-center">
						<div class="text-4xl font-bold text-gray-800 font-mono">
							{formatTime(timeLeft)}
						</div>
						<div class="text-sm text-gray-500 mt-1">
							{isRunning ? 'Running' : 'Paused'}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Control Buttons -->
		<div class="flex justify-center space-x-4 mb-6">
			<button
				on:click={toggleTimer}
				class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
			>
				{isRunning ? 'Pause' : 'Start'}
			</button>

			<button
				on:click={resetTimer}
				class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
			>
				Reset
			</button>
		</div>

		<!-- Session Switcher -->
		<div class="grid grid-cols-3 gap-2 mb-6">
			<button
				on:click={() => switchSession('work')}
				class="py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 {currentSession === 'work' ? 'bg-red-100 text-red-800 border-2 border-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Work
			</button>
			<button
				on:click={() => switchSession('shortBreak')}
				class="py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 {currentSession === 'shortBreak' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Short Break
			</button>
			<button
				on:click={() => switchSession('longBreak')}
				class="py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 {currentSession === 'longBreak' ? 'bg-blue-100 text-blue-800 border-2 border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Long Break
			</button>
		</div>

		<!-- Tips -->
		<div class="bg-gray-50 rounded-lg p-4 text-center">
			<h3 class="font-semibold text-gray-700 mb-2">Pomodoro Technique</h3>
			<p class="text-sm text-gray-600">
				Work for 25 minutes, then take a 5-minute break. After 4 work sessions, take a 15-minute break.
			</p>
		</div>
	</div>
</div>
