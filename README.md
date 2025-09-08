# Pomodoro Timer

A beautiful and functional Pomodoro Timer built with SvelteKit and Tailwind CSS.

## Features

- ⏱️ **Classic Pomodoro Technique**: 25-minute work sessions, 5-minute short breaks, 15-minute long breaks
- 🎨 **Beautiful UI**: Clean, modern design with smooth animations
- 📊 **Progress Tracking**: Visual progress circle and session counter
- 🔊 **Audio Notifications**: Sound alerts when sessions complete
- ⏯️ **Full Control**: Start, pause, reset, and switch between session types
- 📱 **Responsive**: Works perfectly on all devices
- 🧠 **Focus Mode**: Updates browser title with current timer status

## How to Use

1. Click **Start** to begin a 25-minute work session
2. When the timer completes, you'll hear a notification sound
3. Take a 5-minute short break (or 15-minute long break after 4 work sessions)
4. Use the session buttons to manually switch between work and break periods
5. Track your completed sessions with the counter

## Development

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## About the Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a kitchen timer to break work into intervals, typically 25 minutes in length, separated by short breaks. These intervals are known as pomodoros, the plural in English of the Italian word pomodoro (tomato), after the tomato-shaped kitchen timer Cirillo used as a university student.

### The Process:
1. Choose a task to be accomplished
2. Set the timer for 25 minutes
3. Work on the task until the timer rings
4. Take a short break (5 minutes)
5. Every four work sessions, take a longer break (15 minutes)
