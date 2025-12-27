// Script to initialize Firestore collections
// Run this AFTER enabling Firestore in Firebase Console

const admin = require('firebase-admin');

// You'll need to download a service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in the project root

try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.log('⚠️  No service account key found. Using application default credentials.\n');
  console.log('If this fails, download a service account key from Firebase Console:\n');
  console.log('Project Settings > Service Accounts > Generate New Private Key\n');
  
  admin.initializeApp();
}

const db = admin.firestore();

async function initializeCollections() {
  console.log('🔧 Initializing Firestore collections...\n');
  
  try {
    // Create a sample journal entry
    console.log('📝 Creating journals collection...');
    const journalRef = await db.collection('journals').add({
      userId: 'sample_user_123',
      date: '2025-01-01',
      text: 'This is a sample journal entry to initialize the collection. You can delete this.',
      createdAt: admin.firestore.Timestamp.now(),
      _sample: true
    });
    console.log('✅ Journal collection created with sample doc:', journalRef.id);
    
    // Create a sample analytics entry
    console.log('\n📊 Creating analytics collection...');
    const analyticsRef = await db.collection('analytics').add({
      userId: 'sample_user_123',
      analyticsJSON: {
        cognitivePerformance: {
          cognitiveClarity: {
            score: 0,
            trend: 'stable',
            summary: 'Sample analytics entry',
            relativeToBaseline: 0
          }
        }
      },
      createdAt: admin.firestore.Timestamp.now(),
      _sample: true
    });
    console.log('✅ Analytics collection created with sample doc:', analyticsRef.id);
    
    console.log('\n✨ Collections initialized successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Firebase Console > Firestore Database');
    console.log('2. You should see "journals" and "analytics" collections');
    console.log('3. You can delete the sample documents (they have _sample: true)');
    console.log('4. Start using your app normally!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error initializing collections:', error.message);
    console.error('\nMake sure:');
    console.error('1. Firestore is enabled in Firebase Console');
    console.error('2. You have the correct credentials');
    console.error('3. Your Firebase project ID is correct\n');
    process.exit(1);
  }
}

console.log('🚀 Firestore Collection Initializer\n');
console.log('This will create the following collections:');
console.log('  - journals (for journal entries)');
console.log('  - analytics (for AI-generated insights)\n');

initializeCollections();
