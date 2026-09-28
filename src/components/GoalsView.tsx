import React, { useState } from 'react';
import { Flag, Plus, CheckCircle2, Calendar, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Goal } from '../types';
import { formatINR } from '../utils/calculations';

interface GoalsViewProps {
  goals: Goal[];
  currencySymbol: string;
  onAddGoal: (name: string, targetAmount: number, currentAmount: number, deadline?: string) => void;
  onUpdateGoalContribution: (goalId: number, addAmount: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  currencySymbol,
  onAddGoal,
  onUpdateGoalContribution,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [feedback, setFeedback] = useState('');

  const [contributeAmount, setContributeAmount] = useState<Record<number, string>>({});

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currNum = parseFloat(currentAmount || '0');

    if (!name.trim()) {
      alert('Please specify a goal name.');
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }

    onAddGoal(name.trim(), targetNum, isNaN(currNum) ? 0 : currNum, deadline || undefined);
    setFeedback(`Goal "${name.trim()}" created successfully!`);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleContribute = (goalId: number) => {
    const val = parseFloat(contributeAmount[goalId] || '0');
    if (isNaN(val) || val <= 0) {
      alert('Please enter a positive contribution amount.');
      return;
    }
    onUpdateGoalContribution(goalId, val);
    setContributeAmount((prev) => ({ ...prev, [goalId]: '' }));
  };

  // Helper to calculate suggested monthly savings
  const getSuggestedMonthlySavings = (remaining: number, deadlineStr?: string) => {
    if (!deadlineStr || remaining <= 0) return 0;
    const now = new Date();
    const targetDate = new Date(deadlineStr);
    const months =
      (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
    const validMonths = Math.max(1, months);
    return Math.round(remaining / validMonths);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Goals Tracker</h2>
          <p className="text-xs text-slate-400">
            Set ambitious targets, track your progress meters, and calculate required monthly deposits.
          </p>
        </div>

        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-400 font-semibold flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5" />
          <span>{goals.length} Active Targets</span>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Your Progress Milestones</h3>

          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                const suggestedMonthly = getSuggestedMonthlySavings(remaining, g.deadline);

                return (
                  <div
                    key={g.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                          <Flag className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{g.name}</h4>
                          {g.deadline && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Target: {g.deadline}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-white">
                          {formatINR(g.currentAmount, currencySymbol)}
                        </span>
                        <span className="text-xs text-slate-400 block font-mono">
                          of {formatINR(g.targetAmount, currencySymbol)} ({pct}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all ${
                          pct >= 100
                            ? 'bg-emerald-400'
                            : pct >= 60
                            ? 'bg-violet-500'
                            : 'bg-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Breakdown Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="text-slate-400">
                        Remaining: <strong className="text-slate-200">{formatINR(remaining, currencySymbol)}</strong>
                      </div>

                      {remaining > 0 && suggestedMonthly > 0 && (
                        <div className="text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                          Suggested saving: <strong>{formatINR(suggestedMonthly, currencySymbol)} / month</strong>
                        </div>
                      )}

                      {pct >= 100 && (
                        <div className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Goal Target Achieved!
                        </div>
                      )}
                    </div>

                    {/* Quick Contribution Box */}
                    {pct < 100 && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={`Add savings (${currencySymbol})`}
                          value={contributeAmount[g.id] || ''}
                          onChange={(e) =>
                            setContributeAmount((prev) => ({ ...prev, [g.id]: e.target.value }))
                          }
                          className="w-44 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleContribute(g.id)}
                          className="rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-violet-500/30 transition"
                        >
                          + Contribute
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
              No financial goals saved. Use the form to start tracking your next milestone!
            </div>
          )}
        </div>

        {/* Add Goal Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Create New Goal</h3>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Laptop, Emergency Fund, Goa Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount ({currencySymbol})</label>
              <input
                type="number"
                placeholder="e.g. 75000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Already Saved ({currencySymbol})</label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-violet-400 transition shadow-md shadow-violet-500/20"
            >
              Add Financial Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
