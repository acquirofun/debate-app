# ngrok Setup for Free Online Access

## What is ngrok?
ngrok creates a secure tunnel from your local computer to the internet, allowing others to access your local development server.

## Quick Setup:

### 1. Download ngrok
- Go to: https://ngrok.com/download
- Download for Windows
- Extract the zip file

### 2. Sign up for free account
- Go to: https://ngrok.com/signup
- Get your authtoken from the dashboard

### 3. Install and authenticate
Open Command Prompt in the ngrok folder:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4. Start your debate app
```bash
cd "F:\Debate WEB\debate-app"
npm run dev
```

### 5. Create ngrok tunnel
In a new Command Prompt:
```bash
ngrok http 3000
```

### 6. Share the URL
ngrok will give you a URL like: `https://random-name.ngrok-free.app`

Share this URL with your friend! They can access your debate app from anywhere.

## Important Notes:
- Your computer must be running for others to access it
- Free ngrok URLs change each time you restart
- Works great for testing with friends
- No deployment needed