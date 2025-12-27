# Sample User Setup Script

This script creates a sample user and populates their journal with 30 days of realistic entries showing various patterns of burnout and recovery.

## Prerequisites

1. **Firebase Admin Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** (gear icon) → **Service Accounts**
   - Click **Generate new private key**
   - Save the downloaded JSON file as `service-account-key.json` in the project root
   - **Important:** Add `service-account-key.json` to `.gitignore` (already done)

2. **Install firebase-admin** (if not already installed)
   ```bash
   npm install firebase-admin --save-dev
   ```

## Running the Script

```bash
node scripts/create-sample-user.js
```

## Sample User Credentials

- **Email:** sample@gmail.com
- **Password:** 123123

## What the Script Does

1. Creates a user account in Firebase Auth (or uses existing one)
2. Generates 30 days of journal entries with realistic patterns:
   - **Week 1:** High energy, productive, motivated
   - **Week 2:** Building pressure, struggling to focus
   - **Week 3:** Peak stress, burnout signals, overwhelm
   - **Week 4:** Recovery, learning, growth mindset
3. Saves all entries to Firestore with proper timestamps
4. Displays summary with login credentials

## After Running

1. Start your development server: `npm run dev`
2. Go to the login page
3. Login with: sample@gmail.com / 123123
4. Navigate to the dashboard to see journal entries
5. Go to analytics to see the AI-powered insights based on the journal data

## Troubleshooting

- **Error: Could not load service-account-key.json**
  - Make sure you've downloaded the service account key and placed it in the project root
  
- **Error: Permission denied**
  - Verify your Firebase service account has the necessary permissions (Firestore, Auth)
  
- **Error: User already exists**
  - The script will use the existing user and only add new journal entries
