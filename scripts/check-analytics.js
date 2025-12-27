const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
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

const SAMPLE_USER_ID = 'oUyvm5s4IbTuQpajSN7wIz1VuWR2'; // sample@gmail.com

async function checkAnalytics() {
  try {
    console.log('🔍 Checking analytics for sample user...\n');
    
    const q = query(
      collection(db, 'analytics'),
      where('userId', '==', SAMPLE_USER_ID)
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.docs.length} analytics entries\n`);
    
    if (snapshot.docs.length > 0) {
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Analytics ID: ${doc.id}`);
        console.log(`   Date: ${data.date}`);
        console.log(`   Journal Count: ${data.journalCount || 'Not set'}`);
        console.log(`   Created: ${data.createdAt?.toDate().toLocaleString() || 'Unknown'}`);
        console.log('');
      });
    } else {
      console.log('❌ No analytics found for sample user');
      console.log('   User needs to generate analytics first!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAnalytics();
