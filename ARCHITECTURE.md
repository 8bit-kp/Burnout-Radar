# System Architecture

## High-Level Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                              │
└──────────────────────────────────────────────────────────────────┘

1. Sign Up/Login → 2. Write Journals → 3. Generate Analytics → 4. View Insights


## Detailed Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Login/Signup │  │  Dashboard   │  │  Analytics   │              │
│  │    Pages     │  │   (Journal)  │  │  Dashboard   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┴──────────────────┘                       │
│                           │                                          │
│                  ┌────────▼────────┐                                │
│                  │  Auth Context   │                                │
│                  │  (useAuth)      │                                │
│                  └────────┬────────┘                                │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                      BACKEND (API Routes)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /api/journals  ──────────┐                                         │
│   - POST (save)           │                                         │
│   - GET (fetch)           │                                         │
│                           ▼                                          │
│  /api/analytics  ─────►  Firebase Firestore                        │
│   - POST (save)           │  - journals/{id}                        │
│   - GET (fetch)           │  - analytics/{id}                       │
│                           │                                          │
│  /api/analyze            │                                          │
│   - POST ────────────────┼────────► Gemini API                     │
│     (generate analytics)  │           - Analyze text                │
│                           │           - Return JSON                 │
└───────────────────────────┴─────────────────────────────────────────┘


## Data Flow

### 1. Journal Entry Flow
```
User writes entry
     │
     ▼
Dashboard UI
     │
     ▼
POST /api/journals
     │
     ▼
Firebase Firestore
     │
     ▼
journals/{journalId}
{
  userId: "xxx",
  date: "2025-12-27",
  text: "...",
  createdAt: Timestamp
}
```

### 2. Analytics Generation Flow
```
User clicks "Generate Analytics"
     │
     ▼
GET /api/journals?userId=xxx
     │
     ▼
Fetch all user journals
     │
     ▼
POST /api/analyze
{
  journals: [...],
  userId: "xxx"
}
     │
     ▼
Gemini API analyzes text
     │
     ▼
Returns JSON with 8 categories
     │
     ▼
POST /api/analytics
{
  userId: "xxx",
  date: "2025-12-27",
  analyticsJSON: {...}
}
     │
     ▼
Save to Firestore
     │
     ▼
Display in Analytics Dashboard
```

## Component Tree

```
App Layout (AuthProvider)
│
├── page.tsx (redirect logic)
│
├── login/page.tsx
│   └── Sign in form
│
├── signup/page.tsx
│   └── Sign up form
│
├── dashboard/page.tsx
│   ├── Header (with navigation)
│   ├── Calendar Component
│   │   ├── Month navigation
│   │   ├── Day cells
│   │   └── Entry indicators
│   └── Journal Entry/View
│       ├── Text area (write mode)
│       └── Display area (read mode)
│
└── analytics/page.tsx
    ├── Header
    ├── Generate button
    └── Signal Cards (8)
        └── Metrics (16 total)
            ├── Score
            ├── Trend arrow
            ├── Summary
            └── Baseline %
```

## Database Schema

### Firestore Collections

```
firestore
│
├── journals/
│   └── {journalId}
│       ├── userId: string
│       ├── date: string (YYYY-MM-DD)
│       ├── text: string
│       └── createdAt: Timestamp
│
└── analytics/
    └── {analyticsId}
        ├── userId: string
        ├── date: string (YYYY-MM-DD)
        ├── analyticsJSON: object
        │   ├── cognitivePerformance: {...}
        │   ├── emotionalRegulation: {...}
        │   ├── motivationEngagement: {...}
        │   ├── communicationSocial: {...}
        │   ├── timeAttention: {...}
        │   ├── selfRelationship: {...}
        │   ├── growthLearning: {...}
        │   └── patternAwareness: {...}
        └── createdAt: Timestamp
```

## Security Model

```
Firebase Authentication
     │
     ├── Email/Password Auth
     │
     ▼
Firestore Security Rules
     │
     ├── journals/{id}
     │   └── read/write only if userId matches
     │
     └── analytics/{id}
         └── read/write only if userId matches
```

## Analytics Categories

```
8 Signal Categories
│
├── 1. Cognitive Performance
│   ├── Cognitive Clarity Index
│   ├── Decision Fatigue Indicator
│   └── Cognitive Load Distribution
│
├── 2. Emotional Regulation
│   ├── Emotional Volatility Score
│   └── Emotional Recovery Speed
│
├── 3. Motivation & Engagement
│   ├── Intrinsic Motivation Index
│   └── Purpose Drift Detection
│
├── 4. Communication & Social Signals
│   ├── Social Load Indicator
│   └── Assertiveness vs Suppression Balance
│
├── 5. Time & Attention
│   ├── Time Scarcity Index
│   └── Context Switching Signal
│
├── 6. Self-Relationship
│   ├── Self-Compassion vs Self-Criticism
│   └── Agency Index
│
├── 7. Growth & Learning
│   ├── Learning Momentum
│   └── Adaptability Signal
│
└── 8. Pattern Awareness
    ├── Language Pattern Echoes
    └── Pressure Blind Spots
```

## Technology Stack

```
Frontend
├── Next.js 16 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
└── date-fns

Backend
├── Next.js API Routes
├── Firebase Auth
├── Firebase Firestore
└── Google Gemini API

Development
├── ESLint
├── Turbopack
└── npm
```

## Deployment Flow

```
Local Development
     │
     ├── npm run dev
     │
     ▼
Git Repository
     │
     ├── git push
     │
     ▼
Vercel
     │
     ├── Auto-deploy
     ├── Environment variables
     │
     ▼
Production
     │
     ├── https://your-app.vercel.app
     │
     └── Connected to:
         ├── Firebase (prod)
         └── Gemini API
```

## Key Design Decisions

1. **No Client-Side Routing for Auth**: Auth state managed globally
2. **Calendar-First UI**: Visual emphasis on journaling consistency
3. **On-Demand Analytics**: Generated when user requests, not automatic
4. **Baseline-Relative Scoring**: All metrics compared to user's own patterns
5. **Strict Non-Clinical Language**: Enforced in Gemini prompt
6. **Single Entry Per Day**: Encourages focused daily reflection
7. **Plain Language Summaries**: Makes insights accessible
8. **Observational Tone**: No prescriptive advice

## Performance Considerations

- Server Components used where possible
- Client Components only for interactivity
- Firebase SDK initialized once
- Optimistic UI updates (where safe)
- Date utilities from date-fns (tree-shakeable)
- Tailwind for zero-runtime CSS
- API routes for server-side operations

## Error Handling Strategy

```
Frontend
├── Try-catch blocks in all async operations
├── User-friendly error messages
├── Loading states for all async actions
└── Validation before submission

Backend
├── API route error handling
├── Firebase error catching
├── Gemini API error handling
└── Structured error responses

Firebase
└── Security rules prevent unauthorized access
```
