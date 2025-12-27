const admin = require('firebase-admin');


try {
  const serviceAccount = require('../service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error: Could not load service-account-key.json');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts > Generate new private key');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Sample user credentials
const SAMPLE_EMAIL = 'sample@gmail.com';
const SAMPLE_PASSWORD = '123123';

// Generate 30 days of journal entries with realistic patterns
function generateJournalEntries() {
  const entries = [];
  const today = new Date();
  
  const journalTemplates = [
    // Week 1 - High energy, starting strong
    {
      day: 1,
      text: "Started the week feeling energized and motivated. Had a productive meeting where I presented my ideas and they were well received. Feeling confident about the project timeline. Went for a run in the evening, felt great physically and mentally. Looking forward to the week ahead."
    },
    {
      day: 2,
      text: "Good progress on tasks today. Collaborated well with the team on the new feature. Had a brief moment of self-doubt about my approach, but pushed through it. Managed to focus for long stretches without getting distracted. Feeling accomplished."
    },
    {
      day: 3,
      text: "Woke up with good energy. Tackled some challenging problems today and found elegant solutions. Feel like I'm in a good flow state. Had lunch with a colleague, nice to connect socially. A bit tired by evening but satisfied with what I accomplished."
    },
    {
      day: 4,
      text: "Busy day with back-to-back meetings. Felt a little drained by all the context switching, but still managed to get my core work done. Noticed I was checking my phone more than usual. Need to be mindful of that. Overall okay day."
    },
    {
      day: 5,
      text: "Friday felt longer than usual. Wrapped up the week's goals but feeling a bit mentally tired. Had a minor disagreement with a teammate about priorities - resolved it but left me feeling slightly off. Looking forward to the weekend to recharge."
    },
    
    // Week 2 - Some pressure building
    {
      day: 8,
      text: "Weekend was relaxing but Monday hit hard. Inbox feels overwhelming. New requirements came in that will push our timeline. Trying to stay positive but feeling the pressure mounting. Did some planning to break things down into manageable chunks."
    },
    {
      day: 9,
      text: "Struggled to focus today. Mind kept wandering to all the things on my plate. Had to re-read the same document three times. Maybe didn't sleep great last night? Managed to push through but it felt harder than it should have been."
    },
    {
      day: 10,
      text: "Better day today. Got into a rhythm and knocked out several tasks. Felt more like myself. Had a good 1-on-1 with my manager who reassured me about the timeline. Small wins feel important right now. Going to bed earlier tonight."
    },
    {
      day: 11,
      text: "Woke up tired despite sleeping more. Coffee isn't hitting the same. Meetings felt tedious today - found myself zoning out a couple times. Feel like I'm just going through the motions. Need to figure out what's off."
    },
    {
      day: 12,
      text: "Rough day. Got critical feedback on my work that stung more than it should have. Spent too much time dwelling on it instead of just fixing it. Feel like I'm being too hard on myself. Why does this feel so difficult all of a sudden?"
    },
    
    // Week 3 - Peak stress
    {
      day: 15,
      text: "Weekend didn't recharge me like it usually does. Felt anxious about the upcoming week. Monday lived up to my worries - everything feels urgent. Having trouble prioritizing when everything is 'top priority'. Skipped lunch to keep working. Not sustainable."
    },
    {
      day: 16,
      text: "Another day of feeling behind. Made a mistake in the code that I should have caught. Feel scattered and unfocused. Noticed I'm being short with people in messages. Not proud of that. Everything feels like too much right now."
    },
    {
      day: 17,
      text: "Worst day in a while. Barely slept. Mind racing about deadlines. Made it through the day but accomplished less than I hoped. Feel disconnected from the team. Started doubting if I'm even good at this anymore. Need to talk to someone."
    },
    {
      day: 18,
      text: "Took a step back today. Had an honest conversation with my manager about feeling overwhelmed. They were understanding and helped re-prioritize. Feels like a weight lifted just acknowledging it. Small progress on work but that's okay."
    },
    {
      day: 19,
      text: "Slightly better day. Using the new priorities to focus. Still tired but not as scattered. Took a proper lunch break and went outside. Remembered that I don't have to do everything at once. Small wins."
    },
    
    // Week 4 - Recovery and growth
    {
      day: 22,
      text: "Starting to feel more like myself. Weekend gave me perspective. Approached work with more balance today. Said no to a meeting that wasn't essential. Focused on one thing at a time. Actually felt accomplished by end of day."
    },
    {
      day: 23,
      text: "Good momentum today. Finished a major milestone. Team celebrated together. Realized I've been so in my head I forgot to appreciate the progress we're making. Feeling more connected again. Perspective matters."
    },
    {
      day: 24,
      text: "Steady, productive day. No drama, just consistent work. Noticed I'm not checking messages every five minutes anymore. Mind feels clearer. Still have plenty to do but it feels manageable. Learning to pace myself better."
    },
    {
      day: 25,
      text: "Reflecting today on the past few weeks. The rough patch taught me a lot about my limits and warning signs. Recognized that I need better boundaries. Also realized asking for help isn't weakness. Feeling stronger for having gone through it."
    },
    {
      day: 26,
      text: "Great day collaborating with the team. Helped a junior developer with a problem they were stuck on - felt good to support someone else. Work is flowing better. Found myself laughing during standup. Haven't felt this light in weeks."
    },
    {
      day: 29,
      text: "Wrapping up the month feeling grateful. It wasn't all smooth but I learned so much. Better at recognizing when I'm overwhelmed now. Built stronger connections with my team. Work-life balance still needs work but I'm making progress. Proud of how I navigated this month."
    },
    {
      day: 30,
      text: "End of month reflection: grew more than I expected to, both professionally and personally. The challenges pushed me but also showed me my resilience. Setting better intentions for next month - more breaks, clearer boundaries, regular check-ins with myself. Ready for what's next."
    }
  ];
  
  // Add entries for the specified days
  journalTemplates.forEach(template => {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - (30 - template.day));
    
    entries.push({
      date: entryDate.toISOString().split('T')[0],
      text: template.text,
      createdAt: admin.firestore.Timestamp.fromDate(entryDate)
    });
  });
  
  return entries;
}

async function createSampleUser() {
  console.log('🚀 Starting sample user creation...\n');
  
  try {
    // Step 1: Create user in Firebase Auth
    console.log('📝 Creating user in Firebase Auth...');
    let user;
    try {
      user = await auth.createUser({
        email: SAMPLE_EMAIL,
        password: SAMPLE_PASSWORD,
        emailVerified: true
      });
      console.log('✅ User created successfully!');
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}\n`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists, fetching existing user...');
        user = await auth.getUserByEmail(SAMPLE_EMAIL);
        console.log(`   UID: ${user.uid}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 2: Generate journal entries
    console.log('📚 Generating 30 days of journal entries...');
    const journalEntries = generateJournalEntries();
    console.log(`✅ Generated ${journalEntries.length} journal entries\n`);
    
    // Step 3: Save journal entries to Firestore
    console.log('💾 Saving journal entries to Firestore...');
    const batch = db.batch();
    let savedCount = 0;
    
    for (const entry of journalEntries) {
      // Check if entry already exists
      const existingQuery = await db.collection('journals')
        .where('userId', '==', user.uid)
        .where('date', '==', entry.date)
        .get();
      
      if (existingQuery.empty) {
        const docRef = db.collection('journals').doc();
        batch.set(docRef, {
          userId: user.uid,
          date: entry.date,
          text: entry.text,
          createdAt: entry.createdAt
        });
        savedCount++;
      }
    }
    
    await batch.commit();
    console.log(`✅ Saved ${savedCount} new journal entries\n`);
    
    // Step 4: Summary
    console.log('🎉 Sample user setup complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${SAMPLE_EMAIL}`);
    console.log(`Password: ${SAMPLE_PASSWORD}`);
    console.log(`User ID:  ${user.uid}`);
    console.log('═══════════════════════════════════════\n');
    console.log('📊 Journal entries span 30 days showing:');
    console.log('   • High energy and productivity (Week 1)');
    console.log('   • Building pressure and stress (Week 2)');
    console.log('   • Peak overwhelm and burnout signals (Week 3)');
    console.log('   • Recovery and growth mindset (Week 4)');
    console.log('\n✨ You can now login and see the analytics!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
createSampleUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
