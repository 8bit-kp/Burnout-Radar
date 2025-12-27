export interface Journal {
  id?: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  text: string;
  createdAt: Date | string;
}

export interface Analytics {
  id?: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  analyticsJSON: AnalyticsData;
  createdAt: Date | string;
}

export interface AnalyticsData {
  cognitivePerformance: {
    cognitiveClarity: SignalMetric;
    decisionFatigue: SignalMetric;
    cognitiveLoad: SignalMetric;
  };
  emotionalRegulation: {
    emotionalVolatility: SignalMetric;
    emotionalRecovery: SignalMetric;
  };
  motivationEngagement: {
    intrinsicMotivation: SignalMetric;
    purposeDrift: SignalMetric;
  };
  communicationSocial: {
    socialLoad: SignalMetric;
    assertivenessBalance: SignalMetric;
  };
  timeAttention: {
    timeScarcity: SignalMetric;
    contextSwitching: SignalMetric;
  };
  selfRelationship: {
    selfCompassionCriticism: SignalMetric;
    agency: SignalMetric;
  };
  growthLearning: {
    learningMomentum: SignalMetric;
    adaptability: SignalMetric;
  };
  patternAwareness: {
    languageEchoes: SignalMetric;
    pressureBlindSpots: SignalMetric;
  };
}

export interface SignalMetric {
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  summary: string; // Plain language observation
  relativeToBaseline: number; // Percentage change from user's baseline
}
