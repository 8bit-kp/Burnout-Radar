# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] TypeScript errors fixed
- [x] Production build successful (`npm run build`)
- [x] Next.js config optimized for Vercel
- [x] Redis configured for serverless (Upstash)
- [x] Environment variables documented
- [x] .gitignore properly configured
- [x] vercel.json created
- [x] .vercelignore created

## 🚀 Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Add environment variables (see below)
6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add these variables for **Production, Preview, and Development**:

```env
# Firebase (Public - Browser Safe)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZEND4qwXOgbS_ve5vd9tNRgpMJ3PvVgU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=questsync-b61e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=questsync-b61e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=questsync-b61e4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=208135426232
NEXT_PUBLIC_FIREBASE_APP_ID=1:208135426232:web:b5006dd0bfe8e7564ca44d

# Gemini AI (Secret)
GEMINI_API_KEY=AIzaSyCoHHtKBpp81iVNpElZAhuXk9JGJRWs5aQ

# Upstash Redis (Cloud)
UPSTASH_REDIS_REST_URL=https://noted-fawn-36943.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZBPAAIncDEyM2E4NGU4ZDBiZDM0YzZmOGUyNWRmZjA0MTIzZDQxYnAxMzY5NDM
```

### 4. Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **questsync-b61e4**
3. Go to **Authentication → Settings → Authorized domains**
4. Add your Vercel domains:
   - `your-app-name.vercel.app`
   - Your custom domain (if any)

### 5. Test Your Deployment

After deployment:
1. Visit your Vercel URL
2. Test user authentication (signup/login)
3. Test journal creation
4. Test analytics generation
5. Check Vercel Function Logs for any errors

## 🔍 Post-Deployment

### Monitor Your App
- **Function Logs**: Vercel Dashboard → Your Project → Deployments → Function Logs
- **Real-time Logs**: `vercel logs` (if using CLI)
- **Analytics**: Enable Vercel Analytics (optional)

### Performance Optimization
- ✅ Redis caching enabled (Upstash)
- ✅ Static pages pre-rendered
- ✅ API routes optimized
- ✅ Image optimization (Next.js automatic)

### Security Checklist
- ✅ API keys in environment variables (not in code)
- ✅ Firebase rules restrict access to authenticated users
- ✅ GEMINI_API_KEY server-side only
- ✅ Upstash Redis secured with REST API

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check environment variables are set
- Review build logs in Vercel dashboard
- Ensure no TypeScript errors locally: `npm run build`

### Firebase Auth Not Working
- Verify your Vercel domain is in Firebase Authorized domains
- Check Firebase API keys are correct
- Ensure all NEXT_PUBLIC_ variables are set

### Redis Connection Issues
- Upstash credentials correct?
- App will work without Redis (caching optional)
- Check Upstash dashboard for connection stats

### API Routes Failing
- Check function logs in Vercel
- Verify all environment variables are set
- Test locally first: `npm run build && npm start`

## 📊 What's Deployed

### Routes
- `/` - Landing page
- `/login` - Authentication
- `/signup` - User registration
- `/dashboard` - Main app (journal + calendar)
- `/journals` - Journal list view
- `/analytics` - Analytics view

### API Routes
- `/api/journals` - Journal CRUD operations
- `/api/analyze` - AI analysis with Gemini
- `/api/analytics` - Analytics data

### Features
- ✅ Firebase Authentication
- ✅ Firestore Database
- ✅ Gemini AI Analysis
- ✅ Redis Caching (Upstash)
- ✅ Calendar Interface
- ✅ Analytics Dashboard

## 🔄 Continuous Deployment

**Automatic Deployments**:
- Every push to `main` → Production deployment
- Every PR → Preview deployment
- Configure in: Vercel Dashboard → Project Settings → Git

## 🎯 Next Steps

1. [ ] Add custom domain (optional)
2. [ ] Enable Vercel Analytics
3. [ ] Set up monitoring/alerts
4. [ ] Configure branch previews
5. [ ] Add deployment notifications (Slack/Discord)

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

---

**Your app is ready to deploy!** 🎉

Run `git add . && git commit -m "Deploy to Vercel" && git push` to start the deployment process.
