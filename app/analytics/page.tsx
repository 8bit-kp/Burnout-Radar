'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AnalyticsData } from '@/lib/types';

interface SignalCardProps {
  title: string;
  metrics: Array<{
    name: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    summary: string;
    relativeToBaseline: number;
  }>;
}

function SignalCard({ title, metrics }: SignalCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="border-l-4 border-blue-200 pl-4">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-800">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">{metric.score}/100</span>
                <span className={`text-lg ${
                  metric.trend === 'improving' ? 'text-green-600' : 
                  metric.trend === 'declining' ? 'text-red-600' : 
                  'text-slate-400'
                }`}>
                  {metric.trend === 'improving' ? '↗' : 
                   metric.trend === 'declining' ? '↘' : 
                   '→'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">{metric.summary}</p>
            <p className="text-xs text-slate-500">
              {metric.relativeToBaseline > 0 ? '+' : ''}{metric.relativeToBaseline}% from your baseline
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLatestAnalytics();
    }
  }, [user]);

  const fetchLatestAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?userId=${user?.uid}&limit=1`);
      const data = await response.json();
      
      if (data.analytics && data.analytics.length > 0) {
        setAnalytics(data.analytics[0].analyticsJSON);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnalytics = async () => {
    setAnalyzing(true);
    setError('');

    try {
      // Fetch all user journals
      const journalsResponse = await fetch(`/api/journals?userId=${user?.uid}`);
      const journalsData = await journalsResponse.json();

      if (!journalsData.journals || journalsData.journals.length === 0) {
        setError('No journal entries found. Please write some entries first.');
        setAnalyzing(false);
        return;
      }

      // Send journals to Gemini for analysis
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journals: journalsData.journals.map((j: any) => ({
            date: j.date,
            text: j.text,
          })),
          userId: user?.uid,
        }),
      });

      const analyzeData = await analyzeResponse.json();

      if (analyzeData.success) {
        // Save analytics to Firestore
        const today = new Date().toISOString().split('T')[0];
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid,
            date: today,
            analyticsJSON: analyzeData.analytics,
          }),
        });

        setAnalytics(analyzeData.analytics);
      } else {
        setError('Failed to generate analytics');
      }
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError('An error occurred while generating analytics');
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-sm text-slate-600">Language pattern insights from your journal entries</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-900 font-medium">Generate fresh analytics from your journal entries</p>
            <p className="text-xs text-blue-700 mt-1">This will analyze all your entries and create new insights</p>
          </div>
          <button
            onClick={handleGenerateAnalytics}
            disabled={analyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {analyzing ? 'Analyzing...' : 'Generate Analytics'}
          </button>
        </div>

        {!analytics ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No analytics yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Click "Generate Analytics" to analyze your journal entries and see your patterns
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignalCard
              title="Cognitive Performance"
              metrics={[
                {
                  name: 'Cognitive Clarity',
                  ...analytics.cognitivePerformance.cognitiveClarity,
                },
                {
                  name: 'Decision Fatigue',
                  ...analytics.cognitivePerformance.decisionFatigue,
                },
                {
                  name: 'Cognitive Load',
                  ...analytics.cognitivePerformance.cognitiveLoad,
                },
              ]}
            />

            <SignalCard
              title="Emotional Regulation"
              metrics={[
                {
                  name: 'Emotional Volatility',
                  ...analytics.emotionalRegulation.emotionalVolatility,
                },
                {
                  name: 'Emotional Recovery',
                  ...analytics.emotionalRegulation.emotionalRecovery,
                },
              ]}
            />

            <SignalCard
              title="Motivation & Engagement"
              metrics={[
                {
                  name: 'Intrinsic Motivation',
                  ...analytics.motivationEngagement.intrinsicMotivation,
                },
                {
                  name: 'Purpose Drift',
                  ...analytics.motivationEngagement.purposeDrift,
                },
              ]}
            />

            <SignalCard
              title="Communication & Social"
              metrics={[
                {
                  name: 'Social Load',
                  ...analytics.communicationSocial.socialLoad,
                },
                {
                  name: 'Assertiveness Balance',
                  ...analytics.communicationSocial.assertivenessBalance,
                },
              ]}
            />

            <SignalCard
              title="Time & Attention"
              metrics={[
                {
                  name: 'Time Scarcity',
                  ...analytics.timeAttention.timeScarcity,
                },
                {
                  name: 'Context Switching',
                  ...analytics.timeAttention.contextSwitching,
                },
              ]}
            />

            <SignalCard
              title="Self-Relationship"
              metrics={[
                {
                  name: 'Self-Compassion vs Criticism',
                  ...analytics.selfRelationship.selfCompassionCriticism,
                },
                {
                  name: 'Agency',
                  ...analytics.selfRelationship.agency,
                },
              ]}
            />

            <SignalCard
              title="Growth & Learning"
              metrics={[
                {
                  name: 'Learning Momentum',
                  ...analytics.growthLearning.learningMomentum,
                },
                {
                  name: 'Adaptability',
                  ...analytics.growthLearning.adaptability,
                },
              ]}
            />

            <SignalCard
              title="Pattern Awareness"
              metrics={[
                {
                  name: 'Language Echoes',
                  ...analytics.patternAwareness.languageEchoes,
                },
                {
                  name: 'Pressure Blind Spots',
                  ...analytics.patternAwareness.pressureBlindSpots,
                },
              ]}
            />
          </div>
        )}

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900 font-medium">Important Note</p>
          <p className="text-xs text-amber-800 mt-1">
            These insights are derived solely from language patterns in your writing. They are observational only and do not constitute medical, clinical, or therapeutic advice. All scores are relative to your own baseline patterns over time.
          </p>
        </div>
      </main>
    </div>
  );
}
