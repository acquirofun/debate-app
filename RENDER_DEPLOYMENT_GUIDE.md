# Step-by-Step Render Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `debate-app`
3. Make it **Public** (Render free tier requires public repos)
4. Click "Create repository"
5. Copy the repository URL (looks like: `https://github.com/YOUR_USERNAME/debate-app.git`)

## Step 2: Push Your Code to GitHub

Open Command Prompt in your debate-app folder and run:

```bash
cd "F:\Debate WEB\debate-app"

# Add the GitHub repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/debate-app.git

# Push the code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Render

1. Go to https://render.com
2. Click "Sign Up" (use GitHub for easy setup)
3. After signing up, click "New +" → "Web Service"
4. Click "Connect GitHub" 
5. Find and select your `debate-app` repository
6. Configure the deployment:

### Deployment Settings:
- **Name**: `debate-app`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Environment Variables:
Click "Advanced" → "Add Environment Variable"

Add:
- **Key**: `GEMINI_API_KEY`
- **Value**: `YOUR_GEMINI_API_KEY_HERE`

7. Click "Create Web Service"

## Step 4: Wait for Deployment

- Render will build and deploy your app (2-5 minutes)
- You can watch the progress in the Render dashboard
- Once finished, you'll get a URL like: `https://debate-app.onrender.com`

## Step 5: Test Your App

1. Open your Render URL
2. Create a room and share the URL with friends
3. Anyone can now access your debate app!

## Important Notes:

### Free Tier Limitations:
- **Spins down after 15 minutes** of inactivity
- **Takes ~30 seconds** to wake up when accessed
- **750 hours/month** usage limit
- **512 MB RAM**

### For Better Performance:
- Consider upgrading to paid tier ($7/month) for:
  - No spin-down
  - Better performance
  - More RAM

### Troubleshooting:

**Build fails?**
- Check the Render logs for errors
- Ensure all dependencies are in package.json
- Make sure .env.local is NOT committed (it's in .gitignore)

**WebRTC not working?**
- Render free tier might have WebRTC limitations
- Consider using ngrok for better WebRTC support
- Or upgrade to Render paid tier

**Socket.IO connection issues?**
- The app is configured for Socket.IO
- Make sure the start command is `npm start`
- Check Render logs for connection errors

## Alternative: Quick Test with ngrok

If Render deployment is complex, try ngrok first:

```bash
# Install ngrok from https://ngrok.com/download
# Then run:
ngrok http 3000
```

This gives you instant online access without deployment!