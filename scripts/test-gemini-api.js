const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔑 Checking Gemini API Key...');
console.log('Key exists:', !!apiKey);

if (!apiKey) {
  console.error('\n❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Key length:', apiKey.length);
console.log('Key preview:', apiKey.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

// Test with gemini-flash-latest (stable, better free tier support)
console.log('\n🧪 Testing gemini-flash-latest model...');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

model.generateContent('Say "Hello, I am working!" in JSON format')
  .then(result => {
    console.log('✅ API Test Successful!');
    console.log('Response:', result.response.text());
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ API Test Failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
      console.error('\n💡 The API key might be invalid or expired.');
      console.error('Get a new key from: https://aistudio.google.com/apikey');
    } else if (error.message.includes('not found')) {
      console.error('\n💡 The model "gemini-2.0-flash-exp" might not be available.');
      console.error('Try using "gemini-pro" instead.');
    } else if (error.message.includes('quota')) {
      console.error('\n💡 API quota exceeded or billing not enabled.');
    }
    
    process.exit(1);
  });
