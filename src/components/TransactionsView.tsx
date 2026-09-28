import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Expense, Income } from '../types';
import { formatINR } from '../utils/calculations';

interface TransactionsViewProps {
  expenses: Expense[];
  incomes: Income[];
  currencySymbol: string;
  onDeleteExpense: (id: number) => void;
  onDeleteIncome: (id: number) => void;
  onNavigateTab: (tabId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  incomes,
  currencySymbol,
  onDeleteExpense,
  onDeleteIncome,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const categories = ['All', 'Food', 'Rent', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Healthcare', 'Bills', 'Subscriptions', 'Travel', 'Miscellaneous'];

  // Filter Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = (e.description || '').toLowerCase().includes(q);
      const matchCat = (e.category || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    if (minAmount && Number(e.amount) < Number(minAmount)) return false;
    if (maxAmount && Number(e.amount) > Number(maxAmount)) return false;
    return true;
  });

  // Filter Incomes
  const filteredIncomes = incomes.filter((i) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!i.source.toLowerCase().includes(q)) return false;
    }
    if (startDate && i.date < startDate) return false;
    if (endDate && i.date > endDate) return false;
    if (minAmount && Number(i.amount) < Number(minAmount)) return false;
    if (maxAmount && Number(i.amount) > Number(maxAmount)) return false;
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport = activeTab === 'expenses' ? filteredExpenses : filteredIncomes;
    if (dataToExport.length === 0) return;

    let headers: string[];
    let rows: string[];

    if (activeTab === 'expenses') {
      headers = ['Date', 'Category', 'Description', 'Amount'];
      rows = (dataToExport as Expense[]).map((e) => `"${e.date}","${e.category}","${e.description || ''}",${e.amount}`);
    } else {
      headers = ['Date', 'Source', 'Amount'];
      rows = (dataToExport as Income[]).map((i) => `"${i.date}","${i.source}",${i.amount}`);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finsight_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Transaction History</h2>
          <p className="text-xs text-slate-400">Search, filter, manage, and export your personal transactions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigateTab(activeTab === 'expenses' ? 'add_expense' : 'add_income')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record {activeTab === 'expenses' ? 'Expense' : 'Income'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'expenses' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Expenses ({filteredExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'income' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Income ({filteredIncomes.length})
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search description or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Filter (only for expenses) */}
          {activeTab === 'expenses' && (
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Min Amount */}
          <div>
            <input
              type="number"
              placeholder="Min Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Max Amount */}
          <div>
            <input
              type="number"
              placeholder="Max Amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date from */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {(searchQuery || selectedCategory !== 'All' || minAmount || maxAmount || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMinAmount('');
                setMaxAmount('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-sm">
        {activeTab === 'expenses' ? (
          filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-5 py-3.5 text-slate-300 font-mono whitespace-nowrap">{exp.date}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="rounded-md bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-200">{exp.description || '—'}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-rose-400 whitespace-nowrap">
                        -{formatINR(exp.amount, currencySymbol)}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          title="Delete transaction"
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p>No expense transactions match your active filters.</p>
            </div>
          )
        ) : filteredIncomes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition group">
                    <td className="px-5 py-3.5 text-slate-300 font-mono whitespace-nowrap">{inc.date}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {inc.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                      +{formatINR(inc.amount, currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onDeleteIncome(inc.id)}
                        title="Delete income"
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p>No income records match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
