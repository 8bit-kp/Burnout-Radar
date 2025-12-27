# Personal Signal Intelligence

Understanding cognitive, emotional, and performance patterns from daily expression.

## Overview

This is NOT a mental health or medical app. It makes NO diagnoses and gives NO therapy or medical advice. It analyzes language patterns from journal entries to identify cognitive, emotional, and performance signals.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Firebase (Auth + Firestore)
- **AI Analysis**: Google Gemini API

## Features

1. **Daily Journaling**: Calendar-style interface for writing one entry per day
2. **Entry Management**: Browse and view past journal entries
3. **Analytics Dashboard**: 8 categories of language pattern analysis:
   - Cognitive Performance
   - Emotional Regulation
   - Motivation & Engagement
   - Communication & Social Signals
   - Time & Attention
   - Self-Relationship
   - Growth & Learning
   - Pattern Awareness

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create a **Firestore Database** (start in production mode)
4. Get your Firebase config from Project Settings
5. Create a `.env.local` file based on `.env.example`

### 3. Configure Gemini API

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Flow

1. **Sign Up / Login**: Create an account or sign in
2. **Write Journal Entries**: Click on any date in the calendar to write an entry
3. **View Past Entries**: Click on dates with entries (highlighted in blue) to read them
4. **Generate Analytics**: Go to Analytics Dashboard and click "Generate Analytics"
5. **Explore Insights**: Review the 8 categories of language pattern analysis

## Important Constraints

- **No mental health labels**: No clinical terminology
- **No diagnoses**: Observations only, not medical advice
- **No prescriptive advice**: No "you should" statements
- **Baseline-relative**: All scores relative to user's own patterns
- **Language-based**: Analysis derived solely from text patterns

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Gemini API integration
│   │   ├── journals/route.ts     # Journal CRUD
│   │   └── analytics/route.ts    # Analytics CRUD
│   ├── dashboard/page.tsx        # Main journal interface
│   ├── analytics/page.tsx        # Analytics dashboard
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   └── layout.tsx                # Root layout with AuthProvider
├── lib/
│   ├── firebase.ts               # Firebase initialization
│   ├── firestore.ts              # Firestore utilities
│   ├── auth-context.tsx          # Authentication context
│   └── types.ts                  # TypeScript interfaces
└── .env.example                  # Environment template
```

## Disclaimer

This application is for personal reflection and pattern observation only. It does not provide medical, clinical, or therapeutic services. All insights are derived from language patterns and are observational in nature. Consult qualified healthcare professionals for any health-related concerns.

