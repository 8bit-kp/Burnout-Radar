# Quick Setup Guide

## Step-by-Step Instructions

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Start with default location
5. Get configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "</>" to create a web app
   - Copy the config values to `.env.local`

### 3. Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy it to `.env.local` as `GEMINI_API_KEY`

### 4. Firestore Security Rules (Optional but Recommended)

In Firebase Console:
1. Go to Firestore Database > Rules
2. Copy the contents of `firestore.rules` file
3. Publish the rules

### 5. Start the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test the Application

1. Sign up with an email and password
2. Write a few journal entries (3-5 entries recommended)
3. Go to Analytics dashboard
4. Click "Generate Analytics" to see insights

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are set correctly
- Check Firebase project settings match your `.env.local`
- Ensure Authentication and Firestore are enabled

### Gemini API Issues
- Verify API key is valid
- Check you have Gemini API access
- Ensure no rate limits are hit

### Build Errors
- Run `npm install` again
- Delete `.next` folder and rebuild
- Check Node.js version (requires Node 18+)

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all variables from `.env.example` in your hosting platform's environment settings.

## Support

For issues or questions:
- Check the main README.md
- Review Firebase and Gemini API documentation
- Verify security rules are properly set
