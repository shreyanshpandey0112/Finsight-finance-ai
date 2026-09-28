import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PiggyBank,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowRight,
  Info,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Expense, Income, Budget, Goal, MonthlyAggregate, PredictionResult } from '../types';
import {
  formatINR,
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateSavings,
  calculateSavingsRate,
  calculateCategorySpending,
  calculateBudgetUsage,
  getMonthName,
  generateSmartInsights,
} from '../utils/calculations';

interface DashboardViewProps {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  goals: Goal[];
  monthlyAggregates: MonthlyAggregate[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  currencySymbol: string;
  mlResult: PredictionResult;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  incomes,
  budgets,
  goals,
  monthlyAggregates,
  selectedMonth,
  onSelectMonth,
  currencySymbol,
  mlResult,
  onNavigateTab,
}) => {
  // Available months
  const allMonths = Array.from(
    new Set([...expenses.map((e) => e.date.substring(0, 7)), ...incomes.map((i) => i.date.substring(0, 7))])
  ).sort();

  const activeMonth = selectedMonth || (allMonths.length > 0 ? allMonths[allMonths.length - 1] : '2026-03');

  // Filter current month
  const currExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
  const currIncomes = incomes.filter((i) => i.date.startsWith(activeMonth));

  const totalIncome = calculateTotalIncome(currIncomes);
  const totalExpense = calculateTotalExpenses(currExpenses);
  const savings = calculateSavings(totalIncome, totalExpense);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

  // Previous month comparison
  const [y, m] = activeMonth.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevExpenses = expenses.filter((e) => e.date.startsWith(prevMonthStr));
  const prevIncomes = incomes.filter((i) => i.date.startsWith(prevMonthStr));
  const prevTotalExpense = calculateTotalExpenses(prevExpenses);
  const prevTotalIncome = calculateTotalIncome(prevIncomes);

  const expChangePct =
    prevTotalExpense > 0 ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 1000) / 10 : 0;
  const incChangePct =
    prevTotalIncome > 0 ? Math.round(((totalIncome - prevTotalIncome) / prevTotalIncome) * 1000) / 10 : 0;

  // Active budgets for selected month
  const currBudgets = budgets.filter((b) => b.month === activeMonth);

  // Category spending
  const categoryTotals = calculateCategorySpending(currExpenses);
  const categoryEntries = Object.entries(categoryTotals);
  const categorySum = categoryEntries.reduce((acc, [, amt]) => acc + amt, 0);

  // Smart Insights
  const insights = generateSmartInsights(expenses, incomes, currBudgets, activeMonth);

  // Colors for category donut
  const palette = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f43f5e', '#14b8a6', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Monthly Financial Overview</h2>
          <p className="text-xs text-slate-400">
            Viewing real-time analytics for <span className="font-semibold text-emerald-400">{getMonthName(activeMonth)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Billing Period:</label>
          <select
            value={activeMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {allMonths.length > 0 ? (
              allMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))
            ) : (
              <option value={activeMonth}>{getMonthName(activeMonth)}</option>
            )}
          </select>
        </div>
      </div>

      {/* Aceternity UI Hero Banner: AI Neural & Spatial Quick Launch */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Autonomous Financial Engine Active</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              FinSight AI Portfolio Telemetry & 3D Spatial Radar
            </h3>
            <p className="text-xs text-slate-300">
              Real-time capital velocity: <span className="text-emerald-400 font-semibold">{savingsRate}% savings retention</span> with continuous OLS predictive modeling and Gemini 3.8 deep auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('ai_hub')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
            >
              <Bot className="h-4 w-4" />
              <span>Open AI Neural Hub</span>
            </button>

            <button
              onClick={() => onNavigateTab('spatial_radar')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-500/10 transition"
            >
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Launch 3D Web SDK</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TOP-LEVEL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Income</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">{formatINR(totalIncome, currencySymbol)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {prevTotalIncome > 0 ? (
              <>
                {incChangePct >= 0 ? (
                  <span className="inline-flex items-center text-emerald-400 font-semibold">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> +{incChangePct}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-400 font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" /> {incChangePct}%
                  </span>
                )}
                <span className="text-slate-400">vs last month</span>
              </>
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Expenses</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">{formatINR(totalExpense, currencySymbol)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {prevTotalExpense > 0 ? (
              <>
                {expChangePct <= 0 ? (
                  <span className="inline-flex items-center text-emerald-400 font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" /> {expChangePct}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-400 font-semibold">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> +{expChangePct}%
                  </span>
                )}
                <span className="text-slate-400">vs last month</span>
              </>
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Remaining Balance</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className={`mt-3 text-2xl font-black tracking-tight ${savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(savings, currencySymbol)}
          </p>
          <div className="mt-2 text-[11px]">
            {savings >= 0 ? (
              <span className="inline-flex items-center text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Net Monthly Surplus
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-semibold">
                <AlertTriangle className="h-3 w-3 mr-1" /> Monthly Deficit
              </span>
            )}
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Savings Rate</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">{savingsRate}%</p>
          <div className="mt-2 text-[11px]">
            {savingsRate >= 20 ? (
              <span className="text-emerald-400 font-semibold">✓ Meets 20%+ Target</span>
            ) : (
              <span className="text-amber-400 font-medium">Under 20% rule of thumb</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SMART INSIGHTS */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Data-Driven Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.slice(0, 3).map((ins, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-slate-800/90 bg-slate-950/60 p-3 text-xs text-slate-300"
              >
                <span className="text-base leading-none">{ins.icon}</span>
                <span className="leading-snug">{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CHARTS SECTION: Monthly Trend & Spending Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Expense Trend Over Time</h3>
              <p className="text-[11px] text-slate-400">Monthly chronological expenditure curve</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Analytics <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {monthlyAggregates.length > 0 ? (
            <div className="h-64 w-full flex items-end gap-2 pt-6">
              {(() => {
                const maxVal = Math.max(...monthlyAggregates.map((m) => Math.max(m.expense, m.income))) || 1;
                return monthlyAggregates.slice(-8).map((item) => {
                  const expHeight = Math.round((item.expense / maxVal) * 190);
                  const incHeight = Math.round((item.income / maxVal) * 190);
                  const isCurrent = item.month === activeMonth;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full flex items-end justify-center gap-1 h-48">
                        {/* Income Bar */}
                        <div
                          style={{ height: `${incHeight}px` }}
                          className="w-1/2 rounded-t-md bg-emerald-500/60 group-hover:bg-emerald-400 transition"
                          title={`Income: ${formatINR(item.income, currencySymbol)}`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expHeight}px` }}
                          className={`w-1/2 rounded-t-md transition ${
                            isCurrent ? 'bg-rose-500' : 'bg-rose-500/60 group-hover:bg-rose-400'
                          }`}
                          title={`Expenses: ${formatINR(item.expense, currencySymbol)}`}
                        />
                      </div>
                      <span className={`text-[10px] truncate max-w-full ${isCurrent ? 'font-bold text-emerald-400' : 'text-slate-400'}`}>
                        {item.month.split('-')[1]}/{item.month.split('-')[0].substring(2)}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No historical trend data yet. Add expenses or load demo mode.
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
              <span className="text-slate-300">Expenses</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
            <p className="text-[11px] text-slate-400">{getMonthName(activeMonth)} spending distribution</p>
          </div>

          {categoryEntries.length > 0 ? (
            <div className="my-auto py-3">
              {/* Circular SVG representation */}
              <div className="relative flex justify-center items-center h-44">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let cumulative = 0;
                    return categoryEntries.slice(0, 6).map(([cat, amt], idx) => {
                      const pct = categorySum > 0 ? (amt / categorySum) * 100 : 0;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = -cumulative;
                      cumulative += pct;
                      return (
                        <circle
                          key={cat}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={palette[idx % palette.length]}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[10px] text-slate-400">Total</span>
                  <p className="text-xs font-extrabold text-white">{formatINR(categorySum, currencySymbol)}</p>
                </div>
              </div>

              {/* Legend list */}
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {categoryEntries.slice(0, 5).map(([cat, amt], idx) => {
                  const pct = categorySum > 0 ? Math.round((amt / categorySum) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: palette[idx % palette.length] }}
                        />
                        <span className="text-slate-300 truncate">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-slate-200">{formatINR(amt, currencySymbol)}</span>
                        <span className="text-[10px] text-slate-400 w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              No expenses recorded in {getMonthName(activeMonth)}.
            </div>
          )}

          <button
            onClick={() => onNavigateTab('add_expense')}
            className="w-full mt-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* 4. BUDGET STATUS & AI FORECAST PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization Progress Bars */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Budget Utilization</h3>
              <p className="text-[11px] text-slate-400">Monthly limits and automated 80% threshold warnings</p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {currBudgets.length > 0 ? (
            <div className="space-y-4">
              {currBudgets.map((b) => {
                const spent = categoryTotals[b.category] || 0;
                const usage = calculateBudgetUsage(spent, b.budgetAmount);

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{b.category}</span>
                      <span className="text-slate-400">
                        <strong className="text-white">{formatINR(spent, currencySymbol)}</strong> /{' '}
                        {formatINR(b.budgetAmount, currencySymbol)} ({usage.percentage}%)
                      </span>
                    </div>

                    {/* Progress meter */}
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, usage.percentage)}%` }}
                        className={`h-full rounded-full transition-all ${
                          usage.status === 'exceeded'
                            ? 'bg-rose-500'
                            : usage.status === 'warning_80'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    {/* Alert text if 80% or exceeded */}
                    {usage.status === 'exceeded' && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        ⚠ {b.category} budget exceeded by {formatINR(usage.overBy, currencySymbol)}!
                      </p>
                    )}
                    {usage.status === 'warning_80' && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1">
                        <Info className="h-3 w-3 shrink-0" />
                        ⚠ You have used {usage.percentage}% of your {b.category} budget.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 mb-3">No budgets allocated for {getMonthName(activeMonth)}.</p>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/30 transition"
              >
                Set Monthly Category Budgets
              </button>
            </div>
          )}
        </div>

        {/* AI Forecast Summary Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Expense Predictor</h3>
                  <span className="text-[10px] text-indigo-300 font-medium">Linear Regression OLS</span>
                </div>
              </div>
              <span className="rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 border border-indigo-500/30">
                Machine Learning
              </span>
            </div>

            {mlResult.status === 'success' ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-indigo-500/20 bg-slate-950/60 p-4">
                  <span className="text-[11px] text-slate-400 block mb-1">Predicted Next Month Spending</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-black text-white">
                      {formatINR(mlResult.predictedExpense, currencySymbol)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        mlResult.percentageChange <= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {mlResult.percentageChange >= 0 ? '↑ +' : '↓ '}
                      {mlResult.percentageChange}% vs last mo
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  {mlResult.explanation}
                </p>

                {mlResult.overspendingWarning ? (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{mlResult.overspendingMessage}</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{mlResult.overspendingMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-300 mb-2">⚠ {mlResult.message}</p>
                <p className="text-[11px] text-slate-500">
                  Add at least 3 historical months of expenses or click 'Try Demo' to inspect the model.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 italic">AI forecast — estimate based on historical data.</span>
            <button
              onClick={() => onNavigateTab('ai_forecast')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <span>View Forecast Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
