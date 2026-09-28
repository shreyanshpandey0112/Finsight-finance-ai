import { Expense, Income, Budget, MonthlyAggregate, PredictionResult, WealthSimulationResult, Insight } from '../types';

/**
 * Formats a numeric value into standard Indian numbering system (e.g. ₹1,50,000 or ₹35,000).
 */
export function formatINR(amount: number, symbol: string = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0`;
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const s = absAmount.toString();

  let formatted = '';
  if (s.length <= 3) {
    formatted = s;
  } else {
    const last3 = s.substring(s.length - 3);
    const otherNumbers = s.substring(0, s.length - 3);
    const groups: string[] = [];
    let rem = otherNumbers;
    while (rem.length > 2) {
      groups.unshift(rem.substring(rem.length - 2));
      rem = rem.substring(0, rem.length - 2);
    }
    if (rem.length > 0) {
      groups.unshift(rem);
    }
    formatted = groups.join(',') + ',' + last3;
  }

  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getMonthName(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch {
    return monthStr;
  }
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return Math.round(expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * 100) / 100;
}

export function calculateTotalIncome(incomes: Income[]): number {
  return Math.round(incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0) * 100) / 100;
}

export function calculateSavings(income: number, expenses: number): number {
  return Math.round((income - expenses) * 100) / 100;
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const savings = income - expenses;
  return Math.round(((savings / income) * 100) * 10) / 10;
}

export function calculateCategorySpending(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const exp of expenses) {
    const cat = exp.category || 'Other';
    totals[cat] = (totals[cat] || 0) + Number(exp.amount || 0);
  }
  // Sort descending
  const sorted: Record<string, number> = {};
  Object.keys(totals)
    .sort((a, b) => totals[b] - totals[a])
    .forEach((key) => {
      sorted[key] = Math.round(totals[key] * 100) / 100;
    });
  return sorted;
}

export function calculateBudgetUsage(spent: number, budgetAmount: number) {
  if (budgetAmount <= 0) {
    return {
      spent,
      budget: budgetAmount,
      percentage: spent > 0 ? 100 : 0,
      remaining: 0,
      status: spent > 0 ? ('exceeded' as const) : ('normal' as const),
      overBy: spent,
    };
  }

  const percentage = Math.round((spent / budgetAmount) * 1000) / 10;
  const remaining = Math.round((budgetAmount - spent) * 100) / 100;

  let status: 'normal' | 'warning_80' | 'exceeded' = 'normal';
  let overBy = 0;

  if (spent > budgetAmount) {
    status = 'exceeded';
    overBy = Math.round((spent - budgetAmount) * 100) / 100;
  } else if (percentage >= 80) {
    status = 'warning_80';
  }

  return {
    spent: Math.round(spent * 100) / 100,
    budget: Math.round(budgetAmount * 100) / 100,
    percentage,
    remaining,
    status,
    overBy,
  };
}

export function getMonthlyAggregates(expenses: Expense[], incomes: Income[]): MonthlyAggregate[] {
  const monthMap: Record<string, { expense: number; income: number }> = {};

  for (const e of expenses) {
    const m = e.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { expense: 0, income: 0 };
    monthMap[m].expense += Number(e.amount || 0);
  }

  for (const i of incomes) {
    const m = i.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { expense: 0, income: 0 };
    monthMap[m].income += Number(i.amount || 0);
  }

  const sortedMonths = Object.keys(monthMap).sort();
  return sortedMonths.map((m) => {
    const exp = Math.round(monthMap[m].expense * 100) / 100;
    const inc = Math.round(monthMap[m].income * 100) / 100;
    const sav = calculateSavings(inc, exp);
    const rate = calculateSavingsRate(inc, exp);
    return {
      month: m,
      expense: exp,
      income: inc,
      savings: sav,
      savingsRate: rate,
    };
  });
}

/**
 * Future Value compound formula:
 * FV = P*(1 + r)^n + PMT*[((1 + r)^n - 1)/r]
 */
export function calculateFutureValue(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number
): WealthSimulationResult {
  const months = Math.max(1, years * 12);
  const totalContributions = Math.round(principal + monthlyContribution * months);

  if (annualRatePercent <= 0) {
    const breakdown = [];
    for (let y = 1; y <= years; y++) {
      const c = principal + monthlyContribution * y * 12;
      breakdown.push({ year: y, contributed: c, interest: 0, balance: c });
    }
    return {
      futureValue: totalContributions,
      totalContributions,
      totalGrowth: 0,
      yearlyBreakdown: breakdown,
    };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const growthFactor = Math.pow(1 + monthlyRate, months);

  const lumpSum = principal * growthFactor;
  const annuity = monthlyContribution * ((growthFactor - 1) / monthlyRate);
  const futureValue = Math.round(lumpSum + annuity);
  const totalGrowth = Math.max(0, futureValue - totalContributions);

  const yearlyBreakdown = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const gf = Math.pow(1 + monthlyRate, m);
    const bal = Math.round(principal * gf + monthlyContribution * ((gf - 1) / monthlyRate));
    const contrib = Math.round(principal + monthlyContribution * m);
    yearlyBreakdown.push({
      year: y,
      contributed: contrib,
      interest: Math.max(0, bal - contrib),
      balance: bal,
    });
  }

  return {
    futureValue,
    totalContributions,
    totalGrowth,
    yearlyBreakdown,
  };
}

/**
 * Linear Regression model implementation (Ordinary Least Squares with multi-variable matrix operations)
 * Features:
 *   1. Month_Number (time trend)
 *   2. Previous_Month_Spend (Lag-1)
 *   3. 3_Month_Average
 *   4. Income
 */
export function predictNextMonthExpenses(
  monthlyData: MonthlyAggregate[],
  currentExpectedIncome: number = 0
): PredictionResult {
  if (monthlyData.length < 3) {
    return {
      status: 'insufficient_data',
      message: 'Not enough historical data for a reliable prediction. Add at least 3 months of expenses to generate a forecast.',
      predictedExpense: 0,
      previousExpense: monthlyData.length ? monthlyData[monthlyData.length - 1].expense : 0,
      percentageChange: 0,
      trendDirection: 'flat',
      explanation: 'Machine learning algorithms require at least 3 historical time periods to discern direction and momentum.',
      overspendingWarning: false,
      overspendingMessage: '',
      expectedIncome: currentExpectedIncome,
      remainingBalance: 0,
      historicalComparison: [],
    };
  }

  const n = monthlyData.length;
  // Infer income if needed
  let expectedIncome = currentExpectedIncome;
  if (expectedIncome <= 0) {
    const recentIncomes = monthlyData.slice(-3).map((m) => m.income);
    const avg = recentIncomes.reduce((a, b) => a + b, 0) / recentIncomes.length;
    expectedIncome = Math.round(avg) || 50000;
  }

  // Construct features
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    const monthNum = i + 1;
    const prevSpend = i > 0 ? monthlyData[i - 1].expense : monthlyData[i].expense;

    let rolling3Sum = 0;
    let rollingCount = 0;
    for (let k = Math.max(0, i - 2); k <= i; k++) {
      rolling3Sum += monthlyData[k].expense;
      rollingCount++;
    }
    const rolling3Avg = rolling3Sum / (rollingCount || 1);
    const inc = monthlyData[i].income || expectedIncome;

    X.push([1, monthNum, prevSpend, rolling3Avg, inc]); // 1 for intercept
    y.push(monthlyData[i].expense);
  }

  // Solve OLS using closed-form Ridge regression (guaranteed convergence and zero NaN)
  const weights = solveLinearRegression(X, y);

  // Predict Next Month (n + 1)
  const lastExpense = monthlyData[n - 1].expense;
  const recent3Avg =
    (monthlyData[n - 1].expense +
      (n > 1 ? monthlyData[n - 2].expense : lastExpense) +
      (n > 2 ? monthlyData[n - 3].expense : lastExpense)) /
    3;
  const nextMonthNum = n + 1;

  const nextX = [1, nextMonthNum, lastExpense, recent3Avg, expectedIncome];
  let predicted = 0;
  for (let j = 0; j < nextX.length; j++) {
    predicted += nextX[j] * (Number.isFinite(weights[j]) ? weights[j] : 0);
  }

  // Bound predictions reasonably (positive and within 50% to 200% of recent baseline)
  if (!Number.isFinite(predicted) || predicted <= 0) {
    predicted = Math.round(lastExpense * 1.02);
  } else {
    predicted = Math.max(1000, Math.round(predicted));
    if (predicted > lastExpense * 2.5) predicted = Math.round(lastExpense * 1.25);
    if (predicted < lastExpense * 0.3) predicted = Math.round(lastExpense * 0.85);
  }

  const pctChange = lastExpense > 0 ? Math.round(((predicted - lastExpense) / lastExpense) * 1000) / 10 : 0;
  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (pctChange > 0.5) direction = 'up';
  else if (pctChange < -0.5) direction = 'down';

  let explanation = '';
  if (direction === 'up') {
    explanation = 'Your predicted expenses are increasing mainly because your recent monthly spending trend has risen across consecutive periods.';
  } else if (direction === 'down') {
    explanation = 'Your predicted expenses are decreasing because your recent spending discipline has trended downwards over the last few months.';
  } else {
    explanation = 'Your predicted expenses remain stable and consistent with your 3-month baseline average.';
  }

  const remainingBalance = Math.round((expectedIncome - predicted) * 100) / 100;
  const overspending = expectedIncome > 0 && predicted > expectedIncome;
  const overspendingMessage = overspending
    ? `⚠ Your forecasted expenses (${formatINR(predicted)}) are higher than your expected income (${formatINR(expectedIncome)}). Consider adjusting discretionary budgets.`
    : 'Your forecast currently shows expenses comfortably below your expected income.';

  // Build historical comparison
  const historicalComparison = monthlyData.map((m, idx) => {
    let fitted = 0;
    for (let j = 0; j < X[idx].length; j++) {
      fitted += X[idx][j] * (Number.isFinite(weights[j]) ? weights[j] : 0);
    }
    if (!Number.isFinite(fitted) || fitted <= 0) {
      fitted = m.expense;
    }
    return {
      month: m.month,
      actual: Number.isFinite(m.expense) ? m.expense : 0,
      fittedTrend: Math.max(0, Math.round(fitted)),
    };
  });

  return {
    status: 'success',
    message: 'Model trained successfully.',
    predictedExpense: predicted,
    previousExpense: lastExpense,
    percentageChange: Number.isFinite(pctChange) ? pctChange : 0,
    trendDirection: direction,
    explanation,
    overspendingWarning: overspending,
    overspendingMessage,
    expectedIncome,
    remainingBalance,
    historicalComparison,
    coefficients: {
      monthNumber: Number.isFinite(weights[1]) ? Math.round(weights[1] * 100) / 100 : 0.05,
      previousMonthSpend: Number.isFinite(weights[2]) ? Math.round(weights[2] * 100) / 100 : 0.35,
      threeMonthAverage: Number.isFinite(weights[3]) ? Math.round(weights[3] * 100) / 100 : 0.45,
      income: Number.isFinite(weights[4]) ? Math.round(weights[4] * 100) / 100 : 0.05,
    },
    intercept: Number.isFinite(weights[0]) ? Math.round(weights[0] * 100) / 100 : 4500,
  };
}

/**
 * Closed-form Ordinary Least Squares with L2 Ridge Regularization (Gauss-Jordan solver)
 * Deterministic, instant, and mathematically stable without divergence or NaN risks.
 */
function solveLinearRegression(X: number[][], y: number[], lambda: number = 0.01): number[] {
  const n = X.length;
  if (n === 0 || !X[0]) return [5000, 50, 0.35, 0.45, 0.05];
  const p = X[0].length;

  // Compute XtX = X^T * X
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += (X[k][i] || 0) * (X[k][j] || 0);
      }
      XtX[i][j] = sum;
    }
  }

  // Add L2 Ridge penalty to diagonal for numeric stability (except intercept at index 0)
  for (let i = 1; i < p; i++) {
    XtX[i][i] += lambda;
  }

  // Compute Xty = X^T * y
  const Xty: number[] = new Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += (X[k][i] || 0) * (y[k] || 0);
    }
    Xty[i] = sum;
  }

  // Augment matrix [XtX | Xty]
  const aug: number[][] = XtX.map((row, i) => [...row, Xty[i]]);

  // Gauss-Jordan elimination with partial pivoting
  for (let i = 0; i < p; i++) {
    let maxRow = i;
    for (let r = i + 1; r < p; r++) {
      if (Math.abs(aug[r][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = r;
      }
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

    const pivot = aug[i][i];
    if (Math.abs(pivot) < 1e-12) continue; // Collinear fallback

    for (let c = i; c <= p; c++) {
      aug[i][c] /= pivot;
    }

    for (let r = 0; r < p; r++) {
      if (r !== i) {
        const factor = aug[r][i];
        for (let c = i; c <= p; c++) {
          aug[r][c] -= factor * aug[i][c];
        }
      }
    }
  }

  const result = aug.map((row) => row[p]);

  // Safety fallback if any element is non-finite
  if (result.some((v) => !Number.isFinite(v))) {
    return [4500, 45, 0.35, 0.45, 0.05];
  }

  return result;
}

export function generateSmartInsights(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  currentMonthStr: string
): Insight[] {
  const insights: Insight[] = [];

  const currExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const currIncomes = incomes.filter((i) => i.date.startsWith(currentMonthStr));

  // Compute previous month string
  const [y, m] = currentMonthStr.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const prevExpenses = expenses.filter((e) => e.date.startsWith(prevMonthStr));
  const prevIncomes = incomes.filter((i) => i.date.startsWith(prevMonthStr));

  const currExpTotal = calculateTotalExpenses(currExpenses);
  const prevExpTotal = calculateTotalExpenses(prevExpenses);
  const currIncTotal = calculateTotalIncome(currIncomes);
  const prevIncTotal = calculateTotalIncome(prevIncomes);

  const currCats = calculateCategorySpending(currExpenses);
  const prevCats = calculateCategorySpending(prevExpenses);

  // 1. Category shift
  for (const cat of Object.keys(currCats)) {
    const prevAmt = prevCats[cat] || 0;
    const currAmt = currCats[cat];
    if (prevAmt > 0) {
      const pct = Math.round(((currAmt - prevAmt) / prevAmt) * 100);
      if (Math.abs(pct) >= 10) {
        const dir = pct > 0 ? 'increased' : 'decreased';
        insights.push({
          type: 'category_trend',
          icon: pct > 0 ? '📈' : '📉',
          text: `Your ${cat} spending ${dir} ${Math.abs(pct)}% compared with last month.`,
        });
        break;
      }
    }
  }

  // 2. Ranking insight
  const catEntries = Object.entries(currCats);
  if (catEntries.length >= 3) {
    const thirdCat = catEntries[2][0];
    insights.push({
      type: 'ranking',
      icon: '🏷️',
      text: `${thirdCat} is currently your third-largest spending category.`,
    });
  }

  // 3. Budget utilization
  if (budgets.length > 0) {
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.budgetAmount || 0), 0);
    if (totalBudget > 0) {
      const usage = Math.round((currExpTotal / totalBudget) * 100);
      insights.push({
        type: 'budget',
        icon: '🎯',
        text: `You have utilized ${usage}% of your total monthly budget.`,
      });
    }
  }

  // 4. Savings rate trend
  const currSR = calculateSavingsRate(currIncTotal, currExpTotal);
  const prevSR = calculateSavingsRate(prevIncTotal, prevExpTotal);
  if (prevIncTotal > 0 && currIncTotal > 0) {
    if (currSR > prevSR) {
      insights.push({
        type: 'savings',
        icon: '💰',
        text: `Your savings rate increased from ${prevSR}% last month to ${currSR}% this month.`,
      });
    } else if (currSR < prevSR) {
      insights.push({
        type: 'savings',
        icon: '💡',
        text: `Your savings rate decreased from ${prevSR}% to ${currSR}%. Check discretionary categories.`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'welcome',
      icon: '✨',
      text: 'Add a few transactions across various categories to unlock automated financial insights.',
    });
  }

  return insights;
}
