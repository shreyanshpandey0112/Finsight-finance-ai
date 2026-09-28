import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, Trash2, CheckCircle2, User, Coins, Lock } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsViewProps {
  user: UserType;
  currencySymbol: string;
  onUpdateCurrency: (symbol: string) => void;
  onResetDemoData: () => void;
  onWipeData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  currencySymbol,
  onUpdateCurrency,
  onResetDemoData,
  onWipeData,
}) => {
  const [feedback, setFeedback] = useState('');

  const currencies = [
    { label: 'Indian Rupee (₹)', symbol: '₹' },
    { label: 'US Dollar ($)', symbol: '$' },
    { label: 'Euro (€)', symbol: '€' },
    { label: 'British Pound (£)', symbol: '£' },
    { label: 'Dirham (AED)', symbol: 'AED ' },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all transactions and regenerate 14 months of clean demo history?')) {
      onResetDemoData();
      setFeedback('Demo data reset to fresh 14-month synthetic benchmark!');
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  const handleWipe = () => {
    if (window.confirm('Warning: This will clear all transactions, budgets, and goals. Continue?')) {
      onWipeData();
      setFeedback('All local transactions wiped clean.');
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Application Settings</h2>
        <p className="text-xs text-slate-400">Configure currency preferences, user profile, and database lifecycle.</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">User Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[10px] text-slate-400 block mb-1">Full Name</span>
            <span className="text-xs font-bold text-white">{user.name}</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[10px] text-slate-400 block mb-1">Email Address</span>
            <span className="text-xs font-bold text-white">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Preferred Currency</h3>
        </div>

        <p className="text-xs text-slate-400">
          Select your local currency formatting symbol. Changes apply instantly across the entire dashboard and predictor.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currencies.map((c) => {
            const isSelected = currencySymbol === c.symbol;
            return (
              <button
                key={c.symbol}
                onClick={() => {
                  onUpdateCurrency(c.symbol);
                  setFeedback(`Default currency updated to ${c.label}`);
                  setTimeout(() => setFeedback(''), 3000);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{c.label}</span>
                <span className="font-mono text-base font-bold">{c.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management & Demo Controls */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Data Lifecycle Controls</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Quickly re-populate the 14-month synthetic benchmark dataset to test the machine learning predictor and analytics,
          or wipe records to start fresh.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-2.5 text-xs font-bold hover:bg-cyan-500/30 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Regenerate 14-Month Demo Data</span>
          </button>

          <button
            onClick={handleWipe}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Wipe All Records Clean</span>
          </button>
        </div>
      </div>

      {/* Security & Privacy Card */}
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-5 backdrop-blur-xl flex items-start gap-3">
        <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-white font-bold block">Privacy & Security Commitment</strong>
          <p className="text-slate-300 leading-relaxed">
            FinSight AI runs securely in your browser with private client storage and zero external telemetry.
            Your financial records and budget targets remain completely under your control.
          </p>
        </div>
      </div>
    </div>
  );
};
