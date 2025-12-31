# Vercel Deployment Guide for Personal Signal Intelligence

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

#### Firebase (Public - Browser Safe)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZEND4qwXOgbS_ve5vd9tNRgpMJ3PvVgU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=questsync-b61e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=questsync-b61e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=questsync-b61e4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=208135426232
NEXT_PUBLIC_FIREBASE_APP_ID=1:208135426232:web:b5006dd0bfe8e7564ca44d
```

#### Gemini API (Secret - Server Only)
```
GEMINI_API_KEY=AIzaSyCoHHtKBpp81iVNpElZAhuXk9JGJRWs5aQ
```

#### Upstash Redis (Cloud Redis for Vercel)
```
UPSTASH_REDIS_REST_URL=https://noted-fawn-36943.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZBPAAIncDEyM2E4NGU4ZDBiZDM0YzZmOGUyNWRmZjA0MTIzZDQxYnAxMzY5NDM
```

### Step 4: Deploy
Click **"Deploy"** and Vercel will build and deploy your app!

## 📝 Important Notes

### ✅ What's Already Configured
- ✅ Upstash Redis (serverless-ready)
- ✅ Firebase client SDK (works in browser)
- ✅ Gemini API (server-side only)
- ✅ Next.js App Router
- ✅ React Compiler disabled (stable build)

### ⚠️ Firebase Security Rules
Make sure your `firestore.rules` are properly configured:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /journals/{journalId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 🔒 Security Checklist
- [x] API keys in environment variables (not in code)
- [x] Firebase rules restrict access to authenticated users
- [x] GEMINI_API_KEY is server-side only (no NEXT_PUBLIC_ prefix)
- [x] Upstash Redis using REST API (serverless compatible)

## 🛠️ Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure no TypeScript errors: `npm run build`
- Check Vercel build logs

### Redis Not Working
- Verify UPSTASH_REDIS_REST_URL and TOKEN are correct
- App will work without Redis (caching is optional)

### Firebase Auth Issues
- Check Firebase domain whitelist includes your Vercel domain
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain (e.g., `your-app.vercel.app`)

## 🎯 Post-Deployment

1. **Test the deployment**: Visit your Vercel URL
2. **Add custom domain** (optional): Vercel Dashboard → Domains
3. **Monitor logs**: Vercel Dashboard → Deployments → View Function Logs
4. **Set up analytics** (optional): Vercel Analytics

## 📊 Performance Tips

- Redis caching is enabled (via Upstash)
- Images auto-optimized by Vercel
- Edge functions for faster response times
- Consider enabling Vercel Analytics for insights

## 🔄 Continuous Deployment

Every push to `main` branch will automatically trigger a new deployment on Vercel!

---

Need help? Check [Vercel Documentation](https://vercel.com/docs) or [Next.js Deployment](https://nextjs.org/docs/deployment)
