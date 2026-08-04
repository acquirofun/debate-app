# P2P Video Debate App

A modern peer-to-peer video debate platform with AI-powered features.

## Features

### 🎯 AI Motion Generator
- Generate random, high-level debate motions using Google Gemini API
- Ensures balanced and relevant topics for formal debates

### 🪙 Digital Coin Toss
- Fair side assignment (Affirmative/Negative)
- Visual coin flip animation
- Automatic role assignment based on result

### ⏱️ Preparation Timer
- 5-minute countdown before debate starts
- Clear visual feedback
- Automatic transition to debate phase

### 📹 P2P Video System
- WebRTC-based peer-to-peer video calling
- Room code system for easy connection
- Split-screen video layout (local + remote)
- No server-side video processing

### 📝 Live Transcript
- Real-time speech-to-text using Web Speech API
- Structured logging round-by-round
- Speaker identification
- Automatic silence detection

### ⏰ Debate Timer
- Managed speech turns with countdown
- Turn switching functionality
- Pause/resume controls
- Round tracking

### ⚖️ AI Judge
- Evaluates debate transcript using Google Gemini API
- Scores both teams on multiple criteria
- Provides detailed analysis and feedback
- Declares winner based on argument quality

## Quick Start

1. **Set up environment variable**
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## How It Works

1. **Room Setup**: Create a room and share the code with your opponent
2. **Connection**: Both users join the same room for P2P video connection
3. **Motion Generation**: AI generates a debate topic
4. **Coin Toss**: Random assignment of Affirmative/Negative sides
5. **Preparation**: 5-minute timer to prepare arguments
6. **Debate**: Live transcription with managed speech turns
7. **Judgment**: AI evaluates the debate and declares a winner

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.IO
- **Video Streaming**: WebRTC (SimplePeer)
- **Speech Recognition**: Web Speech API
- **AI Integration**: Google Gemini API

## Browser Requirements

- Chrome/Edge (recommended for Web Speech API support)
- Camera and microphone permissions
- Modern browser with WebRTC support

## License

MIT