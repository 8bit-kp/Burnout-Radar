// Test script to debug journal save API

async function testSaveJournal() {
  console.log('🧪 Testing journal save API...\n');
  
  const testData = {
    userId: 'UArXXVqm3DXvWWwnGQ6Yw0Ceh192',
    date: '2025-12-27',
    text: 'Test journal entry from debug script'
  };
  
  console.log('📤 Sending POST request to http://localhost:3000/api/journals');
  console.log('📦 Data:', testData);
  console.log('');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/journals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`⏱️  Response received in ${elapsed}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');
    
    const data = await response.json();
    console.log('📄 Response body:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ SUCCESS! Journal saved with ID:', data.id);
    } else {
      console.log('\n❌ FAILED:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
console.log('Make sure your dev server is running on http://localhost:3000');
console.log('Press Ctrl+C to cancel\n');

testSaveJournal();
