'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AnalyticsData } from '@/lib/types';
import { History } from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface SignalCardProps {
  title: string;
  metrics: Array<{
    name: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    summary: string;
    relativeToBaseline: number;
  }>;
  color: string;
}

function SignalCard({ title, metrics, color }: SignalCardProps) {
  const avgScore = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }}></div>
          <span className="text-2xl font-bold text-slate-700">{avgScore}</span>
        </div>
      </div>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="border-l-4 pl-4" style={{ borderColor: color }}>
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
            {/* Mini bar chart */}
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${metric.score}%`,
                  backgroundColor: color
                }}
              ></div>
            </div>
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
  const [journalCount, setJournalCount] = useState(0);
  const [lastAnalyzedDate, setLastAnalyzedDate] = useState<string | null>(null);
  const [lastAnalyzedJournalCount, setLastAnalyzedJournalCount] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLatestAnalytics();
      fetchJournalCount();
      fetchAnalyticsHistory();
    }
  }, [user]);

  const fetchJournalCount = async () => {
    try {
      const response = await fetch(`/api/journals?userId=${user?.uid}`);
      const data = await response.json();
      const count = data.journals?.length || 0;
      setJournalCount(count);
      
      // Check if there are changes since last analysis
      if (lastAnalyzedJournalCount !== null && count > lastAnalyzedJournalCount) {
        setHasChanges(true);
      } else if (count === lastAnalyzedJournalCount) {
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error fetching journal count:', err);
    }
  };

  const fetchLatestAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?userId=${user?.uid}&limit=1`);
      const data = await response.json();
      
      if (data.analytics && data.analytics.length > 0) {
        const latestAnalytics = data.analytics[0];
        setAnalytics(latestAnalytics.analyticsJSON);
        setLastAnalyzedDate(latestAnalytics.date);
        setSelectedAnalyticsId(latestAnalytics.id);
        
        // Store the journal count when this analytics was generated
        if (latestAnalytics.journalCount !== undefined) {
          setLastAnalyzedJournalCount(latestAnalytics.journalCount);
          // Check if there are new journals since last analysis
          if (journalCount > latestAnalytics.journalCount) {
            setHasChanges(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsHistory = async () => {
    try {
      console.log('Fetching analytics history for user:', user?.uid);
      const response = await fetch(`/api/analytics?userId=${user?.uid}`);
      const data = await response.json();
      
      console.log('Analytics history response:', data);
      
      if (data.analytics) {
        console.log(`Found ${data.analytics.length} analytics entries`);
        setAnalyticsHistory(data.analytics);
      } else {
        console.log('No analytics found in response');
      }
    } catch (err) {
      console.error('Error fetching analytics history:', err);
    }
  };

  const loadAnalyticsById = (analyticsItem: any) => {
    setAnalytics(analyticsItem.analyticsJSON);
    setLastAnalyzedDate(analyticsItem.date);
    setSelectedAnalyticsId(analyticsItem.id);
    setLastAnalyzedJournalCount(analyticsItem.journalCount || null);
    setShowHistory(false);
  };

  const handleGenerateAnalytics = async () => {
    if (journalCount === 0) {
      setError('No journal entries found. Please write some entries first.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      console.log('Fetching journals for analysis...');
      // Fetch all user journals
      const journalsResponse = await fetch(`/api/journals?userId=${user?.uid}&refresh=true`);
      const journalsData = await journalsResponse.json();

      if (!journalsData.journals || journalsData.journals.length === 0) {
        setError('No journal entries found. Please write some entries first.');
        setAnalyzing(false);
        return;
      }

      console.log(`Analyzing ${journalsData.journals.length} journal entries...`);
      
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

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze journals');
      }

      const analyzeData = await analyzeResponse.json();
      console.log('Analysis complete:', analyzeData);

      if (analyzeData.success && analyzeData.analytics) {
        console.log('Saving analytics to database...');
        // Save analytics to Firestore
        const today = new Date().toISOString().split('T')[0];
        const saveResponse = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid,
            date: today,
            analyticsJSON: analyzeData.analytics,
            journalCount: journalsData.journals.length, // Store how many journals were analyzed
          }),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save analytics');
        }

        console.log('Analytics saved successfully!');
        setAnalytics(analyzeData.analytics);
        setLastAnalyzedDate(today);
        setLastAnalyzedJournalCount(journalsData.journals.length);
        setHasChanges(false);
        setError('');
        
        // Refresh analytics history to show the new entry
        fetchAnalyticsHistory();
      } else {
        const errorMsg = analyzeData.error || analyzeData.details || 'Failed to generate analytics. Please try again.';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError('An error occurred while generating analytics: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Analyzing Overlay */}
      {analyzing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Analyzing Your Journals</h3>
              <p className="mt-2 text-sm text-slate-600">
                AI is examining your language patterns and generating insights...
              </p>
              <p className="mt-4 text-xs text-slate-500">This may take 10-30 seconds</p>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-sm text-slate-600">Language pattern insights from your journal entries</p>
            </div>
            <div className="flex gap-3">
              {analyticsHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  History {analyticsHistory.length > 1 && `(${analyticsHistory.length})`}
                </button>
              )}
              <button
                onClick={() => router.push('/journals')}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                All Journals
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Analytics History Dropdown */}
        {showHistory && analyticsHistory.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Analytics History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analyticsHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadAnalyticsById(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedAnalyticsId === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {item.journalCount || 0} journals analyzed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAnalyticsId === item.id && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                      <span className="text-slate-400">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}
        
        {analytics && lastAnalyzedDate && !analyzing && !hasChanges && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <div>
              ✅ Analytics up to date! Viewing insights from {new Date(lastAnalyzedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({lastAnalyzedJournalCount} journals analyzed)
            </div>
            {analyticsHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                View History ({analyticsHistory.length})
              </button>
            )}
          </div>
        )}
        
        {analytics && hasChanges && !analyzing && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <div>
              ⚠️ You have {journalCount - (lastAnalyzedJournalCount || 0)} new journal(s) since last analysis. Generate new analytics to see updated insights!
            </div>
            {analyticsHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 cursor-pointer transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                View History ({analyticsHistory.length})
              </button>
            )}
          </div>
        )}

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-900 font-medium">
                {hasChanges ? 'Update analytics with new journal entries' : 'Generate fresh analytics from your journal entries'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {journalCount > 0 
                  ? hasChanges 
                    ? `${journalCount - (lastAnalyzedJournalCount || 0)} new journal(s) to analyze`
                    : `${journalCount} journal ${journalCount === 1 ? 'entry' : 'entries'} available`
                  : 'Write some journal entries first to enable analytics'}
                {lastAnalyzedDate && !hasChanges && ` • Last analyzed: ${lastAnalyzedDate} (up to date)`}
                {lastAnalyzedDate && hasChanges && ` • Last analyzed: ${lastAnalyzedDate} (${lastAnalyzedJournalCount} journals)`}
              </p>
            </div>
            <button
              onClick={handleGenerateAnalytics}
              disabled={analyzing || journalCount === 0}
              className={`px-6 py-2 rounded-lg transition-colors font-medium whitespace-nowrap ${
                hasChanges 
                  ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
              } disabled:cursor-not-allowed`}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : hasChanges ? '🔄 Update Analytics' : '🔍 Generate Analytics'}
            </button>
          </div>
        </div>

        {!analytics ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No analytics yet</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              {journalCount === 0 
                ? 'Start by writing journal entries on the dashboard. Once you have some entries, come back here to generate insights from your language patterns.'
                : `You have ${journalCount} journal ${journalCount === 1 ? 'entry' : 'entries'}. Click "Generate Analytics" above to analyze your writing patterns and see your personal insights.`
              }
            </p>
            {journalCount === 0 && (
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Radar Chart - Overall View */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Signal Strength</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    {
                      category: 'Cognitive',
                      score: Math.round((
                        analytics.cognitivePerformance.cognitiveClarity.score +
                        analytics.cognitivePerformance.decisionFatigue.score +
                        analytics.cognitivePerformance.cognitiveLoad.score
                      ) / 3)
                    },
                    {
                      category: 'Emotional',
                      score: Math.round((
                        analytics.emotionalRegulation.emotionalVolatility.score +
                        analytics.emotionalRegulation.emotionalRecovery.score
                      ) / 2)
                    },
                    {
                      category: 'Motivation',
                      score: Math.round((
                        analytics.motivationEngagement.intrinsicMotivation.score +
                        analytics.motivationEngagement.purposeDrift.score
                      ) / 2)
                    },
                    {
                      category: 'Social',
                      score: Math.round((
                        analytics.communicationSocial.socialLoad.score +
                        analytics.communicationSocial.assertivenessBalance.score
                      ) / 2)
                    },
                    {
                      category: 'Time',
                      score: Math.round((
                        analytics.timeAttention.timeScarcity.score +
                        analytics.timeAttention.contextSwitching.score
                      ) / 2)
                    },
                    {
                      category: 'Self',
                      score: Math.round((
                        analytics.selfRelationship.selfCompassionCriticism.score +
                        analytics.selfRelationship.agency.score
                      ) / 2)
                    },
                    {
                      category: 'Growth',
                      score: Math.round((
                        analytics.growthLearning.learningMomentum.score +
                        analytics.growthLearning.adaptability.score
                      ) / 2)
                    },
                    {
                      category: 'Patterns',
                      score: Math.round((
                        analytics.patternAwareness.languageEchoes.score +
                        analytics.patternAwareness.pressureBlindSpots.score
                      ) / 2)
                    },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Detailed Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top & Bottom Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Cog. Clarity', score: analytics.cognitivePerformance.cognitiveClarity.score, color: '#3b82f6' },
                      { name: 'Emot. Recovery', score: analytics.emotionalRegulation.emotionalRecovery.score, color: '#8b5cf6' },
                      { name: 'Motivation', score: analytics.motivationEngagement.intrinsicMotivation.score, color: '#ec4899' },
                      { name: 'Social Load', score: analytics.communicationSocial.socialLoad.score, color: '#f59e0b' },
                      { name: 'Time Mgmt', score: analytics.timeAttention.timeScarcity.score, color: '#10b981' },
                      { name: 'Agency', score: analytics.selfRelationship.agency.score, color: '#06b6d4' },
                      { name: 'Learning', score: analytics.growthLearning.learningMomentum.score, color: '#f97316' },
                      { name: 'Awareness', score: analytics.patternAwareness.languageEchoes.score, color: '#6366f1' },
                    ].sort((a, b) => b.score - a.score)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                      {[0,1,2,3,4,5,6,7].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#10b981' : 
                          index === 1 ? '#3b82f6' : 
                          index >= 6 ? '#ef4444' : '#64748b'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Signal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignalCard
              title="Cognitive Performance"
              color="#3b82f6"
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
              color="#8b5cf6"
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
              color="#ec4899"
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
              color="#f59e0b"
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
              color="#10b981"
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
              color="#06b6d4"
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
              color="#f97316"
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
              color="#6366f1"
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
          </>
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
