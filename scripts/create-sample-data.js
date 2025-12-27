const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
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

const userId = 'oUyvm5s4IbTuQpajSN7wIz1VuWR2'; // sample@gmail.com

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

async function createSampleData() {
  console.log('🚀 Creating sample journal entries for sample@gmail.com...\n');
  
  try {
    for (const journal of sampleJournals) {
      const docRef = await addDoc(collection(db, 'journals'), {
        userId,
        date: journal.date,
        text: journal.text,
        createdAt: Timestamp.now(),
      });
      
      console.log(`✅ Created journal for ${journal.date} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully created', sampleJournals.length, 'sample journals!');
    console.log('\nYou can now:');
    console.log('1. Login with: sample@gmail.com / 123123');
    console.log('2. View journals in the calendar');
    console.log('3. Generate analytics from these entries');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
