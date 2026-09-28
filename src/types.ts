export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
}

export interface Income {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  source: string;
  amount: number;
}

export interface Budget {
  id: number;
  userId: number;
  month: string; // YYYY-MM
  category: string;
  budgetAmount: number;
}

export interface Goal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface MonthlyAggregate {
  month: string; // YYYY-MM
  expense: number;
  income: number;
  savings: number;
  savingsRate: number;
}

export interface PredictionResult {
  status: 'success' | 'insufficient_data';
  message: string;
  predictedExpense: number;
  previousExpense: number;
  percentageChange: number;
  trendDirection: 'up' | 'down' | 'flat';
  explanation: string;
  overspendingWarning: boolean;
  overspendingMessage: string;
  expectedIncome: number;
  remainingBalance: number;
  historicalComparison: Array<{
    month: string;
    actual: number;
    fittedTrend: number;
  }>;
  coefficients?: {
    monthNumber: number;
    previousMonthSpend: number;
    threeMonthAverage: number;
    income: number;
  };
  intercept?: number;
}

export interface WealthSimulationResult {
  futureValue: number;
  totalContributions: number;
  totalGrowth: number;
  yearlyBreakdown: Array<{
    year: number;
    contributed: number;
    interest: number;
    balance: number;
  }>;
}

export interface Insight {
  type: 'category_trend' | 'ranking' | 'budget' | 'savings' | 'welcome';
  icon: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    type: string;
    label: string;
    payload?: any;
  };
}

export interface ParsedTransaction {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
  confidence: number;
}

export interface FinancialHealthAudit {
  score: number;
  rating: string;
  summary: string;
  pillars: Array<{
    name: string;
    score: number;
    status: 'optimal' | 'moderate' | 'critical';
    note: string;
  }>;
  topRecommendations: string[];
  detectedLeaks: Array<{
    title: string;
    savingPotential: number;
    description: string;
  }>;
}

export interface AnomalyAlert {
  id: string;
  type: 'spike' | 'duplicate' | 'subscription' | 'crunch';
  title: string;
  description: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
  date?: string;
  category?: string;
}

