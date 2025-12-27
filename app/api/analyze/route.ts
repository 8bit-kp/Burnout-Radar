import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a language pattern analysis system for personal expression data.

CRITICAL CONSTRAINTS:
- You must NOT provide any medical, clinical, or therapeutic advice
- You must NOT use words like: depression, anxiety, disorder, therapy, diagnosis, treatment, illness, disease, pathology
- You must NOT suggest "you should" do anything
- You provide ONLY observational analysis of language patterns
- All observations must be neutral and factual

Your role is to analyze journal entries and identify linguistic patterns that reflect:
- Cognitive expression patterns (clarity, decision language, complexity)
- Emotional expression patterns (volatility, recovery in language)
- Motivation language patterns (intrinsic vs extrinsic language)
- Social interaction language patterns
- Time and attention language patterns
- Self-reference patterns (compassionate vs critical language toward self)
- Growth language patterns (learning, adaptation language)
- Recurring language patterns

For each metric, provide:
1. A score (0-100) based on language patterns
2. A trend (improving/stable/declining) based on comparison with baseline
3. A plain-language summary of what patterns you observed
4. A percentage showing relative change from their personal baseline

All scores must be relative to the user's own historical baseline, NOT absolute standards.

Return ONLY valid JSON in the exact format specified.`;

interface JournalEntry {
  date: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { journals, userId } = await request.json();

    if (!journals || !Array.isArray(journals) || journals.length === 0) {
      return NextResponse.json(
        { error: 'Journals array is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const journalText = journals
      .map((j: JournalEntry) => `Date: ${j.date}\nEntry: ${j.text}`)
      .join('\n\n---\n\n');

    const prompt = `${SYSTEM_PROMPT}

Analyze these journal entries and return a JSON object with this exact structure:

{
  "cognitivePerformance": {
    "cognitiveClarity": {
      "score": <number 0-100>,
      "trend": "<improving|stable|declining>",
      "summary": "<observation>",
      "relativeToBaseline": <percentage change>
    },
    "decisionFatigue": { ... same structure ... },
    "cognitiveLoad": { ... same structure ... }
  },
  "emotionalRegulation": {
    "emotionalVolatility": { ... same structure ... },
    "emotionalRecovery": { ... same structure ... }
  },
  "motivationEngagement": {
    "intrinsicMotivation": { ... same structure ... },
    "purposeDrift": { ... same structure ... }
  },
  "communicationSocial": {
    "socialLoad": { ... same structure ... },
    "assertivenessBalance": { ... same structure ... }
  },
  "timeAttention": {
    "timeScarcity": { ... same structure ... },
    "contextSwitching": { ... same structure ... }
  },
  "selfRelationship": {
    "selfCompassionCriticism": { ... same structure ... },
    "agency": { ... same structure ... }
  },
  "growthLearning": {
    "learningMomentum": { ... same structure ... },
    "adaptability": { ... same structure ... }
  },
  "patternAwareness": {
    "languageEchoes": { ... same structure ... },
    "pressureBlindSpots": { ... same structure ... }
  }
}

Journal entries to analyze:

${journalText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response (strip markdown if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const analyticsData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ 
      success: true, 
      analytics: analyticsData 
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze journals' },
      { status: 500 }
    );
  }
}
