#!/usr/bin/env node

/**
 * Reset Sample User Script
 * 
 * This script:
 * 1. Deletes all existing journals for sample@gmail.com
 * 2. Creates fresh sample journal entries
 * 3. Clears the Redis cache
 * 
 * Usage: node scripts/reset-sample-user.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc, Timestamp } = require('firebase/firestore');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SAMPLE_USER_ID = 'oUyvm5s4IbTuQpajSN7wIz1VuWR2'; // sample@gmail.com

const sampleJournals = [
  {
    date: '2025-12-20',
    text: 'Started the day feeling energized and motivated. Had a productive morning working on the new project. Team meeting went well, everyone was engaged and collaborative. Feeling good about the progress we\'re making.',
  },
  {
    date: '2025-12-21',
    text: 'Woke up a bit tired today. Too many late meetings yesterday drained my energy. Struggled to focus in the afternoon. Need to set better boundaries with work hours. Did manage to finish the important tasks though.',
  },
  {
    date: '2025-12-22',
    text: 'Much better day! Got enough sleep and it made all the difference. Morning run helped clear my mind. Work flowed naturally, no context switching issues. Had a great conversation with a colleague about our shared interests.',
  },
  {
    date: '2025-12-23',
    text: 'Feeling overwhelmed with the amount of work piling up. Multiple deadlines approaching and not sure I can handle them all. Keep questioning if I\'m doing the right things. Need to prioritize better and maybe ask for help.',
  },
  {
    date: '2025-12-24',
    text: 'Took some time to reflect and plan. Created a priority list and delegated some tasks. Already feeling more in control. Remember that I don\'t have to do everything myself. Team is supportive and willing to help.',
  },
  {
    date: '2025-12-25',
    text: 'Holiday break day - spent time with family and completely disconnected from work. Realized how much I needed this rest. Feeling grateful for the people in my life. Sometimes stepping back gives the best perspective.',
  },
  {
    date: '2025-12-26',
    text: 'Back to work but with renewed energy. The break really helped. Approached tasks with fresh eyes and found creative solutions. Had insights about improving my workflow. Excited to implement new ideas next week.',
  },
  {
    date: '2025-12-27',
    text: 'Reflecting on the past week - noticed a pattern of highs and lows. When I take care of myself (sleep, exercise, boundaries), everything flows better. Need to make self-care non-negotiable, not something I do "if I have time".',
  },
];

async function resetSampleUser() {
  console.log('🔄 Resetting sample user (sample@gmail.com)...\n');
  
  try {
    // Step 1: Delete existing journals
    console.log('📚 Step 1: Deleting existing journals...');
    const q = query(collection(db, 'journals'), where('userId', '==', SAMPLE_USER_ID));
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'journals', docSnap.id));
      }
      console.log(`   ✅ Deleted ${snapshot.docs.length} existing journals\n`);
    } else {
      console.log('   ℹ️  No existing journals found\n');
    }
    
    // Step 2: Create fresh sample journals
    console.log('📝 Step 2: Creating fresh sample journals...');
    for (const journal of sampleJournals) {
      const docRef = await addDoc(collection(db, 'journals'), {
        userId: SAMPLE_USER_ID,
        date: journal.date,
        text: journal.text,
        createdAt: Timestamp.now(),
      });
      console.log(`   ✅ Created journal for ${journal.date}`);
    }
    console.log('');
    
    // Step 3: Clear Redis cache
    console.log('🗑️  Step 3: Clearing Redis cache...');
    const cacheKey = `journals:${SAMPLE_USER_ID}`;
    await redis.del(cacheKey);
    console.log('   ✅ Cache cleared\n');
    
    console.log('🎉 Sample user reset complete!\n');
    console.log('Login credentials:');
    console.log('  Email: sample@gmail.com');
    console.log('  Password: 123123');
    console.log(`\n  Journal entries: ${sampleJournals.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting sample user:', error);
    process.exit(1);
  }
}

resetSampleUser();
