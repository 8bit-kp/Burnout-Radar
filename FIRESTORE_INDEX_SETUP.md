# Firestore Index Setup Guide

## Why You Need This

Your app is slow to fetch journals because Firestore requires a **composite index** for queries that use both `where()` and `orderBy()`.

## Quick Fix (Automatic)

1. **Try to load your dashboard** - Open your app in the browser
2. **Check the browser console** (F12) - You should see an error like:
   ```
   The query requires an index. You can create it here: https://console.firebase.google.com/...
   ```
3. **Click the link** in the error message - It will take you directly to Firebase Console
4. **Click "Create Index"** - Wait 1-2 minutes for it to build
5. **Refresh your app** - It should now be fast!

## Manual Setup (If needed)

If you don't see the automatic link, create the index manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Enter these settings:
   - **Collection ID**: `journals`
   - **Fields to index**:
     - Field: `userId`, Order: `Ascending`
     - Field: `date`, Order: `Descending`
   - **Query scope**: `Collection`
6. Click **Create**
7. Wait for the index to build (usually 1-2 minutes)

## What I've Already Done

I've updated your API route to:
- **Log timing information** - Check your terminal/console to see how long queries take
- **Fallback to simple query** - If the index doesn't exist, it will fetch without ordering and sort in memory
- **Prevent duplicate fetches** - Won't fetch if already fetching

## Expected Performance

- **Without index**: 2-10 seconds (slow!)
- **With index**: 100-500ms (fast!)

## Check Performance

After creating the index, open the browser console and look for:
```
Fetched 30 journals in 250ms
```

This tells you how fast the query is running.
