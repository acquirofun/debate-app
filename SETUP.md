# P2P Video Debate App - Setup Guide

## Environment Configuration

Before running the application, you need to set up your Google Gemini API key:

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Create a `.env.local` file in the root directory
3. Add your API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

## Installation

The project is already set up with all dependencies. If you need to reinstall:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Create or Join a Room**: 
   - Click "Create New Room" to generate a random room code
   - Or enter an existing room code to join

2. **Video Connection**: 
   - Allow camera/microphone permissions when prompted
   - Wait for your opponent to join the same room

3. **Generate Motion**: 
   - Click "Generate Motion" to get a AI-generated debate topic

4. **Coin Toss**: 
   - Click "Flip Coin" to randomly assign Affirmative/Negative sides

5. **Preparation**: 
   - 5-minute timer starts automatically
   - Prepare your arguments

6. **Debate**: 
   - Live speech-to-text transcription
   - Timer for each speech turn
   - Switch turns between speakers

7. **AI Judge**: 
   - Click "End Debate" when finished
   - AI evaluates the transcript and declares a winner

## Features

- **AI Motion Generator**: Uses Google Gemini API to generate debate topics
- **Coin Flip**: Random side assignment with visual feedback
- **P2P Video**: WebRTC-based video calling
- **Live Transcript**: Real-time speech recognition
- **Debate Timer**: Managed speech turns with countdown
- **AI Judge**: Evaluates arguments and scores the debate

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO for signaling
- **Video**: WebRTC with SimplePeer
- **Speech**: Web Speech API
- **AI**: Google Gemini API