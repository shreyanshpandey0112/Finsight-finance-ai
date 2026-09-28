import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  Bot,
  TrendingUp,
  Target,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
  onLoadDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess, onLoadDemo }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'demo'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }
    // Simulate login
    const user: User = {
      id: 1,
      name: loginEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: loginEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    onLoginSuccess(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 10,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 800);
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Expense Analytics',
      desc: 'Interactive Plotly donut charts, monthly spending trajectories, and category breakdowns.',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Bot,
      title: 'AI Expense Forecast',
      desc: 'Scikit-learn Linear Regression model predicting next month spend with lag features & dynamic overspending alerts.',
      color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: TrendingUp,
      title: 'Wealth Simulator',
      desc: 'Compound growth formula projections with interactive Cash (3%) vs Investment (10%) comparisons.',
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30',
    },
    {
      icon: Target,
      title: 'Budget Tracking',
      desc: 'Real-time category spending meters with automated 80% thresholds and budget exceeded warnings.',
      color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Financial Goals',
      desc: 'Milestone target progress bars with recommended monthly savings rates.',
      color: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/30',
    },
    {
      icon: FileSpreadsheet,
      title: 'Import & Export',
      desc: 'CSV drag-and-drop import with schema validation and one-click data export.',
      color: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner / Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FinSight AI — Intelligent Financial Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Track. Understand. <span className="text-emerald-400">Predict.</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Your personal finance dashboard powered by Scikit-learn Machine Learning. Forecast next month's spending,
              avoid deficits with early warnings, and simulate compound wealth growth.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onLoadDemo}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 hover:scale-[1.02] transition active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Try Demo Mode (Instant 14 Months Data)</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white">Startup-Grade Personal Finance Engine</h2>
            <p className="text-sm text-slate-400 mt-1">
              Built with machine learning predictive modeling, dynamic budget tracking, and real-time financial analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-slate-900/50 p-6 backdrop-blur-sm transition hover:border-slate-700 hover:bg-slate-900/80 ${feat.color}`}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-900/80 flex items-center justify-center mb-4 border border-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auth Section with Tabs */}
        <div className="max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'register' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setActiveTab('demo');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'demo' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Instant Demo
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              {successMsg}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Sign In to FinSight AI
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Shreyansh Pandey"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="shreyansh@su.edu"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition mt-2"
              >
                Complete Registration
              </button>
            </form>
          )}

          {activeTab === 'demo' && (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">One-Click Demonstration</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pre-populates 14 months of synthetic transactions, categories, budgets, and savings goals so the Machine
                  Learning model and analytics illuminate right away.
                </p>
              </div>

              <button
                onClick={onLoadDemo}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
              >
                Launch Demo Experience Now
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <p>FinSight AI &copy; 2026. Private, client-side personal finance intelligence.</p>
      </footer>
    </div>
  );
};
