import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Expense, Income, MonthlyAggregate } from '../types';
import {
  formatINR,
  calculateCategorySpending,
  getMonthName,
} from '../utils/calculations';

interface AnalyticsViewProps {
  expenses: Expense[];
  incomes: Income[];
  monthlyAggregates: MonthlyAggregate[];
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  incomes,
  monthlyAggregates,
  currencySymbol,
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('All');
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');

  const categories = [
    'Food',
    'Rent',
    'Transport',
    'Shopping',
    'Entertainment',
    'Education',
    'Healthcare',
    'Bills',
    'Subscriptions',
    'Travel',
    'Miscellaneous',
  ];

  const allMonths = Array.from(new Set(monthlyAggregates.map((m) => m.month))).sort();

  // Filtered dataset for category analytics
  let filteredExpenses = expenses;
  if (selectedMonthFilter !== 'All') {
    filteredExpenses = filteredExpenses.filter((e) => e.date.startsWith(selectedMonthFilter));
  }
  if (selectedCatFilter !== 'All') {
    filteredExpenses = filteredExpenses.filter((e) => e.category === selectedCatFilter);
  }

  const categoryTotals = calculateCategorySpending(filteredExpenses);
  const categoryEntries = Object.entries(categoryTotals);
  const totalSpend = categoryEntries.reduce((acc, [, val]) => acc + val, 0);

  const palette = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f43f5e', '#14b8a6', '#3b82f6', '#eab308'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Expense & Inflow Analytics</h2>
          <p className="text-xs text-slate-400">
            Interactive multi-dimensional visualization of spending categories, trends, and saving rates.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Months Combined</option>
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ROW 1: Category Distribution (Donut) & Category Ranking (Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Distribution Donut */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Category Distribution</h3>
              <p className="text-[11px] text-slate-400">Proportional expenditure breakdown</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">Total: {formatINR(totalSpend, currencySymbol)}</span>
          </div>

          {categoryEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="relative flex justify-center items-center h-48">
                <svg className="h-44 w-44 -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let cumulative = 0;
                    return categoryEntries.map(([cat, amt], idx) => {
                      const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = -cumulative;
                      cumulative += pct;
                      return (
                        <circle
                          key={cat}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={palette[idx % palette.length]}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="hover:opacity-80 transition cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[10px] text-slate-400">Total Outlay</span>
                  <p className="text-xs font-extrabold text-white">{formatINR(totalSpend, currencySymbol)}</p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {categoryEntries.map(([cat, amt], idx) => {
                  const pct = totalSpend > 0 ? Math.round((amt / totalSpend) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: palette[idx % palette.length] }}
                        />
                        <span className="text-slate-300 truncate">{cat}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              No matching expense transactions found for selected filters.
            </div>
          )}
        </div>

        {/* 2. Category-Wise Spending (Horizontal Bars) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white mb-1">Category Spending Ranking</h3>
          <p className="text-[11px] text-slate-400 mb-4">Ranked from largest to smallest outlay</p>

          {categoryEntries.length > 0 ? (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {categoryEntries.map(([cat, amt]) => {
                const maxCatAmt = categoryEntries[0][1] || 1;
                const pctOfMax = Math.round((amt / maxCatAmt) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cat}</span>
                      <span className="text-slate-400 font-mono">{formatINR(amt, currencySymbol)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pctOfMax}%` }}
                        className="h-full rounded-full bg-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              No expense entries recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: Income vs Expenses & Monthly Savings Rate Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Income vs Expense Comparison Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Income vs Expense History</h3>
              <p className="text-[11px] text-slate-400">Monthly side-by-side inflows and outflows</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                <span className="text-slate-300">Expense</span>
              </div>
            </div>
          </div>

          {monthlyAggregates.length > 0 ? (
            <div className="h-56 w-full flex items-end gap-2 pt-4">
              {(() => {
                const maxVal = Math.max(...monthlyAggregates.map((m) => Math.max(m.income, m.expense))) || 1;
                return monthlyAggregates.slice(-8).map((item) => {
                  const incH = Math.round((item.income / maxVal) * 160);
                  const expH = Math.round((item.expense / maxVal) * 160);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-44">
                        <div
                          style={{ height: `${incH}px` }}
                          className="w-1/2 rounded-t-md bg-emerald-500/80 hover:bg-emerald-400 transition"
                          title={`Income: ${formatINR(item.income, currencySymbol)}`}
                        />
                        <div
                          style={{ height: `${expH}px` }}
                          className="w-1/2 rounded-t-md bg-rose-500/80 hover:bg-rose-400 transition"
                          title={`Expense: ${formatINR(item.expense, currencySymbol)}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-full">
                        {item.month.split('-')[1]}/{item.month.split('-')[0].substring(2)}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              No monthly aggregates available.
            </div>
          )}
        </div>

        {/* 4. Monthly Savings Rate Trend Line Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Savings Rate Trend (%)</h3>
              <p className="text-[11px] text-slate-400">Target benchmark: 20%+ of monthly income</p>
            </div>
            <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-400">
              Target: 20%
            </span>
          </div>

          {monthlyAggregates.length > 0 ? (
            <div className="h-56 w-full flex flex-col justify-end">
              <div className="relative h-44 flex items-end">
                {/* 20% benchmark dashed guideline */}
                <div className="absolute w-full border-b border-dashed border-cyan-500/40 bottom-[33%] left-0 pointer-events-none" />
                <span className="absolute right-0 bottom-[34%] text-[9px] text-cyan-400/80 font-mono">20% Goal</span>

                <div className="w-full flex items-end justify-between gap-2 h-44 z-10">
                  {monthlyAggregates.slice(-8).map((item) => {
                    const clampedRate = Math.max(0, Math.min(60, item.savingsRate));
                    const barHeight = Math.round((clampedRate / 60) * 150);
                    const meetsGoal = item.savingsRate >= 20;

                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition">
                          {item.savingsRate}%
                        </span>
                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-4/5 rounded-t-lg transition ${
                            meetsGoal ? 'bg-cyan-500 group-hover:bg-cyan-400' : 'bg-amber-500/70 group-hover:bg-amber-400'
                          }`}
                          title={`${item.month}: ${item.savingsRate}% savings rate`}
                        />
                        <span className="text-[10px] text-slate-400 truncate max-w-full">
                          {item.month.split('-')[1]}/{item.month.split('-')[0].substring(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              No historical savings rate data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
