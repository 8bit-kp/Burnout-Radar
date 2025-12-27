const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

console.log('🔍 Fetching available models...\n');

fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
  .then(response => response.json())
  .then(data => {
    console.log('Available models for generateContent:\n');
    
    if (data.models) {
      data.models
        .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
        .forEach(model => {
          console.log('✓', model.name.replace('models/', ''));
        });
    } else {
      console.log('Response:', data);
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
