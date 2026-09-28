import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Info, Plus, Calendar } from 'lucide-react';
import { Budget, Expense } from '../types';
import {
  formatINR,
  calculateBudgetUsage,
  getMonthName,
  calculateCategorySpending,
} from '../utils/calculations';

interface BudgetsViewProps {
  budgets: Budget[];
  expenses: Expense[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  currencySymbol: string;
  onSetBudget: (month: string, category: string, amount: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  expenses,
  selectedMonth,
  onSelectMonth,
  currencySymbol,
  onSetBudget,
}) => {
  const [formMonth, setFormMonth] = useState(selectedMonth || '2026-03');
  const [category, setCategory] = useState('Food');
  const [budgetLimit, setBudgetLimit] = useState('5000');
  const [feedback, setFeedback] = useState('');

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

  // Months available
  const allMonths = Array.from(new Set(expenses.map((e) => e.date.substring(0, 7)))).sort();
  if (allMonths.length === 0) allMonths.push('2026-03');

  const activeMonth = selectedMonth || allMonths[allMonths.length - 1];

  // Expenses for the active month
  const currMonthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
  const categoryTotals = calculateCategorySpending(currMonthExpenses);

  // Active budgets for selected month
  const currBudgets = budgets.filter((b) => b.month === activeMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(budgetLimit);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid budget limit greater than ₹0.');
      return;
    }
    onSetBudget(formMonth, category, amountNum);
    setFeedback(`Budget of ${formatINR(amountNum, currencySymbol)} set for ${category} (${getMonthName(formMonth)}).`);
    setTimeout(() => setFeedback(''), 3500);
  };

  const totalAllocated = currBudgets.reduce((acc, b) => acc + b.budgetAmount, 0);
  const totalSpentAcrossBudgets = currBudgets.reduce((acc, b) => acc + (categoryTotals[b.category] || 0), 0);
  const overallUsage = totalAllocated > 0 ? Math.round((totalSpentAcrossBudgets / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Monthly Budgets & Alerts</h2>
          <p className="text-xs text-slate-400">
            Set spending guardrails with automated alerts at 80% threshold and over-budget notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Month:</span>
          <select
            value={activeMonth}
            onChange={(e) => {
              onSelectMonth(e.target.value);
              setFormMonth(e.target.value);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-xs text-slate-400">Total Budget Allocated</span>
          <p className="text-xl font-extrabold text-white mt-1">{formatINR(totalAllocated, currencySymbol)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-xs text-slate-400">Total Spent in Budgeted Areas</span>
          <p className="text-xl font-extrabold text-slate-200 mt-1">{formatINR(totalSpentAcrossBudgets, currencySymbol)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-xs text-slate-400">Overall Utilization</span>
          <p className={`text-xl font-extrabold mt-1 ${overallUsage > 100 ? 'text-rose-400' : overallUsage >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {overallUsage}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Category Budgets for {getMonthName(activeMonth)}</h3>

          {currBudgets.length > 0 ? (
            <div className="space-y-5">
              {currBudgets.map((b) => {
                const spent = categoryTotals[b.category] || 0;
                const usage = calculateBudgetUsage(spent, b.budgetAmount);

                return (
                  <div key={b.id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span className="text-xs font-bold text-white">{b.category}</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono">
                        <strong className="text-white">{formatINR(spent, currencySymbol)}</strong> /{' '}
                        {formatINR(b.budgetAmount, currencySymbol)} ({usage.percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
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

                    {/* Warning Notices */}
                    {usage.status === 'exceeded' && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg mt-1 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>⚠ {b.category} budget exceeded by {formatINR(usage.overBy, currencySymbol)}.</span>
                      </div>
                    )}

                    {usage.status === 'warning_80' && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg mt-1">
                        <Info className="h-3.5 w-3.5 shrink-0" />
                        <span>⚠ You have used {usage.percentage}% of your {b.category} budget.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No budgets established yet for {getMonthName(activeMonth)}. Use the form to allocate category limits.
            </div>
          )}
        </div>

        {/* Create / Adjust Budget Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Set / Adjust Budget</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Month</label>
              <input
                type="text"
                placeholder="YYYY-MM (e.g. 2026-03)"
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Spending Limit ({currencySymbol})</label>
              <input
                type="number"
                step="100"
                min="100"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              Save Budget Limit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
