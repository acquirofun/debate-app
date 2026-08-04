# Free Deployment Options for P2P Video Debate App

## Option 1: ngrok (Easiest - Recommended for Testing)

### Steps:
1. Download ngrok from https://ngrok.com/download
2. Sign up at https://ngrok.com/signup (free)
3. Extract and run ngrok
4. Get your authtoken from ngrok dashboard
5. Run: `ngrok config add-authtoken YOUR_AUTH_TOKEN`
6. Start your app: `cd debate-app && npm run dev`
7. In new terminal: `ngrok http 3000`
8. Share the https:// URL with friends

**Pros:**
- Instant setup (5 minutes)
- No deployment needed
- Perfect for testing
- Free

**Cons:**
- Your computer must be running
- URL changes each restart
- Not for production

---

## Option 2: Render.com (Best for Free Production Hosting)

### Why Render?
- Free tier for web services
- Supports Node.js with WebSockets
- Automatic HTTPS
- Persistent deployment

### Steps:
1. Go to https://render.com
2. Sign up (free with GitHub)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: debate-app
   - **Root Directory**: debate-app
   - **Build Command**: npm run build
   - **Start Command**: npm start
   - **Instance Type**: Free
6. Add Environment Variables:
   - `GEMINI_API_KEY`: Your API key
7. Click "Create Web Service"
8. Wait for deployment (2-3 minutes)
9. Share your app URL: `https://your-app.onrender.com`

**Note:** Free tier spins down after 15 minutes of inactivity, but wakes up on request.

---

## Option 3: Railway.app (Alternative Free Hosting)

### Steps:
1. Go to https://railway.app
2. Sign up (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Next.js
6. Add environment variable: `GEMINI_API_KEY`
7. Deploy
8. Get your public URL

---

## Option 4: Glitch.com (Easiest for Beginners)

### Steps:
1. Go to https://glitch.com
2. Click "New Project" → "glitch-hello-node"
3. Replace all files with your project
4. Add .env file with your API key
5. Click "Show" → "In a new window"
6. Share the live URL

**Pros:**
- Easiest interface
- Free hosting
- Built-in editor

**Cons:**
- Limited resources
- Not ideal for WebRTC

---

## Recommendation:

**For testing with friends:** Use **ngrok** (5-minute setup)

**For permanent hosting:** Use **Render.com** (free tier, supports WebSockets)

**For beginners:** Use **Glitch.com** (simplest interface)

---

## Current Limitations:

The app uses WebRTC for P2P video, which works best when:
- Both users have good internet
- Browser supports WebRTC (Chrome/Edge recommended)
- Not behind strict corporate firewalls

For production use, consider adding:
- STUN/TURN servers for better connectivity
- Fallback to server-based streaming
- Mobile app support