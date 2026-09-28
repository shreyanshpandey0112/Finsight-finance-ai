import React, { useState } from 'react';
import { PlusCircle, BadgeIndianRupee, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/calculations';

interface FormsViewProps {
  mode: 'expense' | 'income';
  currencySymbol: string;
  onAddExpense: (date: string, category: string, description: string, amount: number) => void;
  onAddIncome: (date: string, source: string, amount: number) => void;
  onNavigateTab: (tabId: string) => void;
}

export const FormsView: React.FC<FormsViewProps> = ({
  mode,
  currencySymbol,
  onAddExpense,
  onAddIncome,
  onNavigateTab,
}) => {
  // Expense Form State
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState('');

  // Income Form State
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incomeSource, setIncomeSource] = useState('Salary');
  const [customSource, setCustomSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

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
    '+ Custom Category...',
  ];

  const incomeSources = ['Salary', 'Freelance', 'Pocket Money', 'Business', 'Other', '+ Custom Source...'];

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than ₹0.');
      return;
    }

    const finalCat = category === '+ Custom Category...' ? customCategory.trim() : category;
    if (!finalCat) {
      alert('Please enter a custom category name.');
      return;
    }

    onAddExpense(expDate, finalCat, description.trim(), numAmount);
    setFeedback(`Expense of ${formatINR(numAmount, currencySymbol)} added successfully! Dashboard updated.`);
    setDescription('');
    setAmount('');
    if (category === '+ Custom Category...') {
      setCustomCategory('');
    }
  };

  const handleSubmitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    const numAmount = parseFloat(incomeAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a positive income amount.');
      return;
    }

    const finalSource = incomeSource === '+ Custom Source...' ? customSource.trim() : incomeSource;
    if (!finalSource) {
      alert('Please specify the income source.');
      return;
    }

    onAddIncome(incDate, finalSource, numAmount);
    setFeedback(`Income of ${formatINR(numAmount, currencySymbol)} from ${finalSource} recorded successfully!`);
    setIncomeAmount('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'expense' ? 'Record New Expense' : 'Add Income Inflow'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'expense'
              ? 'Categorize and track outlays to train the AI model.'
              : 'Keep track of earnings, freelance payouts, and stipends.'}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab(mode === 'expense' ? 'add_income' : 'add_expense')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-xl transition"
        >
          <span>Switch to {mode === 'expense' ? 'Income' : 'Expense'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {mode === 'expense' ? (
        <form onSubmit={handleSubmitExpense} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Spending Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {category === '+ Custom Category...' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Category Name</label>
              <input
                type="text"
                placeholder="e.g. Pet Care, Fitness Gym, Gaming"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Merchant</label>
              <input
                type="text"
                placeholder="e.g. Supermarket grocery refill, Metro commute"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick preset amount chips */}
          <div>
            <span className="block text-[11px] text-slate-400 mb-2">Quick Amount Presets:</span>
            <div className="flex flex-wrap gap-2">
              {[200, 500, 1000, 2000, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition"
                >
                  +{formatINR(preset, currencySymbol)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Save Expense Transaction</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitIncome} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                value={incDate}
                onChange={(e) => setIncDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Income Source</label>
              <select
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {incomeSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {incomeSource === '+ Custom Source...' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Source Title</label>
              <input
                type="text"
                placeholder="e.g. Dividend, Consultancy, Tutoring"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 50000"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <span className="block text-[11px] text-slate-400 mb-2">Common Inflow Benchmarks:</span>
            <div className="flex flex-wrap gap-2">
              {[5000, 10000, 25000, 50000, 75000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setIncomeAmount(preset.toString())}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition"
                >
                  +{formatINR(preset, currencySymbol)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <BadgeIndianRupee className="h-4 w-4" />
            <span>Record Income Inflow</span>
          </button>
        </form>
      )}
    </div>
  );
};
