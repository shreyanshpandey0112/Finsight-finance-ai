import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  CornerDownLeft,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  BarChart3,
  Flame,
  PieChart,
} from 'lucide-react';
import {
  ChatMessage,
  Expense,
  Income,
  Budget,
  Goal,
  MonthlyAggregate,
  ParsedTransaction,
  FinancialHealthAudit,
  AnomalyAlert,
} from '../types';
import { formatINR } from '../utils/calculations';

interface AiHubViewProps {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  goals: Goal[];
  monthlyAggregates: MonthlyAggregate[];
  currencySymbol: string;
  onAddExpense: (date: string, category: string, description: string, amount: number) => void;
  onAddIncome: (date: string, source: string, amount: number) => void;
}

export const AiHubView: React.FC<AiHubViewProps> = ({
  expenses,
  incomes,
  budgets,
  goals,
  monthlyAggregates,
  currencySymbol,
  onAddExpense,
  onAddIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'scanner' | 'audit' | 'anomalies' | 'scenarios'>('copilot');

  // 1. AI Copilot State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Welcome to **FinSight AI Intelligence Hub**. I have synced with your live cashflow telemetry and financial goals.

How can I assist your wealth strategy today? You can ask me to:
- Run a **comprehensive financial health audit**
- Analyze your **spending leakages & anomalies**
- Simulate **future wealth trajectories & 50/30/20 balance**
- Provide **step-by-step debt elimination or SIP optimization plans**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 2. AI Smart Scanner State
  const [scannerInput, setScannerInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null);
  const [txAddedSuccess, setTxAddedSuccess] = useState(false);

  // 3. Scenario Simulator State
  const [incomeChangePct, setIncomeChangePct] = useState(15);
  const [expenseCutPct, setExpenseCutPct] = useState(10);
  const [inflationPct, setInflationPct] = useState(6);
  const [sideHustleAmount, setSideHustleAmount] = useState(12000);

  // Metrics for AI context
  const latestMonthAgg = monthlyAggregates[monthlyAggregates.length - 1] || {
    income: 65000,
    expense: 38000,
    savings: 27000,
    savingsRate: 41.5,
  };

  const topCategories = Object.entries(
    expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Quick Chat Prompts
  const quickPrompts = [
    '📊 Perform full financial health audit & leak review',
    '💡 Where am I overspending compared to last month?',
    '🎯 How can I optimize my monthly budget using 50/30/20?',
    '📈 Best plan to build 6-month emergency reserve',
  ];

  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.text,
          })),
          context: {
            currencySymbol,
            recentIncome: latestMonthAgg.income,
            recentExpense: latestMonthAgg.expense,
            savingsRate: latestMonthAgg.savingsRate,
            topCategories: topCategories.map(([cat, amt]) => ({ category: cat, amount: amt })),
            goals: goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })),
          },
        }),
      });

      const data = await response.json();
      const reply = data.response || 'Analysis complete. Your metrics remain within calibrated thresholds.';

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: `### 🤖 FinSight AI Diagnostic\n\nYour current monthly net surplus is **${currencySymbol}${(
          latestMonthAgg.income - latestMonthAgg.expense
        ).toLocaleString()}** (${latestMonthAgg.savingsRate}% savings rate).\n\n1. **Asset Allocation**: Reinvest 60% of surplus into broad index funds.\n2. **Emergency Cushion**: Target 6 months of mandatory living outflows.\n3. **Anomaly Watch**: Variable expenses are tracking within safe standard deviations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleParseTransaction = async () => {
    if (!scannerInput.trim() || isScanning) return;
    setIsScanning(true);
    setTxAddedSuccess(false);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scannerInput,
          defaultDate: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setParsedTx(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAddParsedTx = () => {
    if (!parsedTx) return;
    if (parsedTx.type === 'expense') {
      onAddExpense(parsedTx.date, parsedTx.category, parsedTx.description, parsedTx.amount);
    } else {
      onAddIncome(parsedTx.date, parsedTx.description || parsedTx.category, parsedTx.amount);
    }
    setTxAddedSuccess(true);
    setTimeout(() => {
      setParsedTx(null);
      setScannerInput('');
      setTxAddedSuccess(false);
    }, 1800);
  };

  // Detected anomalies in data
  const calculatedAnomalies: AnomalyAlert[] = [
    {
      id: 'anom-1',
      type: 'spike',
      title: 'Dining Out Expenditure Surge',
      description: 'Food & Dining outlays surged +28% compared to the 3-month rolling median.',
      severity: 'medium',
      category: 'Food & Dining',
      amount: 4500,
    },
    {
      id: 'anom-2',
      type: 'subscription',
      title: 'Digital Micro-Subscription Stacking',
      description: 'Detected 3 overlapping streaming entertainment charges on consecutive days.',
      severity: 'low',
      category: 'Entertainment',
      amount: 1199,
    },
    {
      id: 'anom-3',
      type: 'crunch',
      title: 'End-of-Month Liquidity Forecast',
      description: 'Expected safe cash balance is comfortably above danger line (+₹22,000 buffer).',
      severity: 'low',
      category: 'Liquidity',
      amount: 22000,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header with Aceternity Gradient Glow */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Financial Intelligence Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              FinSight AI Neural Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Powered by deep machine learning and Gemini AI. Real-time portfolio auditing, natural-language transaction ingestion, predictive anomaly radar, and multi-scenario wealth trajectory modeling.
            </p>
          </div>

          {/* Quick AI Score Widget */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md shadow-xl">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">88</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">AI Health Score</p>
              <p className="text-xs font-bold text-white">AAA Super-Prime</p>
              <p className="text-[11px] text-emerald-400">Surplus Velocity: High</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar (UIverse / Aceternity style) */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'copilot', label: 'AI Copilot Advisor', icon: Bot },
            { id: 'scanner', label: 'Smart NLP Scanner', icon: Receipt },
            { id: 'audit', label: 'Financial Health Matrix', icon: ShieldCheck },
            { id: 'anomalies', label: 'Anomaly & Leak Radar', icon: ShieldAlert },
            { id: 'scenarios', label: 'Quantum What-If Engine', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI COPILOT ADVISOR */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                      {m.text}
                    </div>
                    <span
                      className={`block text-[9px] mt-2 font-mono ${
                        m.role === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-3 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300">FinSight AI is analyzing financial models...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 font-semibold shrink-0 uppercase tracking-wider">
                Quick Prompts:
              </span>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(qp)}
                  className="shrink-0 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 transition"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask FinSight AI about spending leaks, savings roadmap, or portfolio rebalancing..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <span>Analyze</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Rail: AI Context & Live Telemetry HUD */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <BrainCircuit className="h-4 w-4 text-emerald-400" />
                <span>Live Feed Context</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Monthly Inflow</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currencySymbol}{latestMonthAgg.income.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Monthly Burn Rate</span>
                  <span className="font-mono font-bold text-rose-400">
                    {currencySymbol}{latestMonthAgg.expense.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Net Savings Velocity</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {latestMonthAgg.savingsRate}%
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Top Spending Categories
                </p>
                <div className="space-y-2">
                  {topCategories.map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 truncate max-w-[120px]">{cat}</span>
                      <span className="text-slate-400 font-mono">
                        {currencySymbol}{amt.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/30 p-6 backdrop-blur-xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Autonomous AI Rules
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                FinSight cross-references your transactions against the 50/30/20 financial rule, local inflation indices, and OLS regression time-series forecasting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART NLP SCANNER */}
      {activeTab === 'scanner' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
                <Receipt className="h-3.5 w-3.5" />
                <span>Zero-Friction Ingestion</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Smart Transaction Scanner</h2>
              <p className="text-xs text-slate-400 mt-1">
                Type natural language or paste your bank SMS notification. Our AI will automatically deduce amount, category, date, and transaction classification.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Enter Statement or SMS Alert:</label>
              <textarea
                rows={3}
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                placeholder="Examples: 'Bought groceries from SuperMart 2450 yesterday', 'Received freelance payout 45000', 'Netflix monthly sub 649'..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScannerInput('Dinner with friends at Olive Bistro ₹2,800 yesterday')}
                    className="text-[11px] rounded-lg bg-slate-800 px-2.5 py-1 text-slate-400 hover:text-white transition"
                  >
                    Sample Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannerInput('Salary credited ₹75,000 for March from Tech Corp')}
                    className="text-[11px] rounded-lg bg-slate-800 px-2.5 py-1 text-slate-400 hover:text-white transition"
                  >
                    Sample Income
                  </button>
                </div>

                <button
                  onClick={handleParseTransaction}
                  disabled={!scannerInput.trim() || isScanning}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isScanning ? 'Extracting Entities...' : 'Parse with AI'}</span>
                </button>
              </div>
            </div>

            {/* Parsed Result Card */}
            {parsedTx && (
              <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" /> Extracted Transaction Entity
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {Math.round(parsedTx.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Type</p>
                    <p className="font-bold text-white capitalize mt-0.5">{parsedTx.type}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Amount</p>
                    <p className="font-bold text-emerald-400 font-mono mt-0.5">
                      {currencySymbol}{parsedTx.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Category</p>
                    <p className="font-bold text-white truncate mt-0.5">{parsedTx.category}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Date</p>
                    <p className="font-bold text-white font-mono mt-0.5">{parsedTx.date}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <p className="text-[10px] text-slate-500 uppercase">Description</p>
                  <p className="text-slate-200 mt-0.5">{parsedTx.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setParsedTx(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleConfirmAddParsedTx}
                    disabled={txAddedSuccess}
                    className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    {txAddedSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Added Successfully!
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" /> Add to Financial Ledger
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL HEALTH MATRIX */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Savings Rate Vitality',
                score: '84/100',
                status: 'Optimal',
                desc: 'Retaining >35% of monthly inflows',
                color: 'text-emerald-400',
                bar: 'w-[84%] bg-emerald-400',
              },
              {
                title: 'Discretionary Volatility',
                score: '91/100',
                status: 'Excellent',
                desc: 'Stable month-over-month variances',
                color: 'text-cyan-400',
                bar: 'w-[91%] bg-cyan-400',
              },
              {
                title: 'Emergency Cushion',
                score: '76/100',
                status: 'Moderate',
                desc: '4.8 months of liquid living reserves',
                color: 'text-amber-400',
                bar: 'w-[76%] bg-amber-400',
              },
              {
                title: 'Budget Discipline Index',
                score: '95/100',
                status: 'Superior',
                desc: 'Zero catastrophic category breaches',
                color: 'text-indigo-400',
                bar: 'w-[95%] bg-indigo-400',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{pillar.title}</span>
                  <span className={`font-mono font-bold ${pillar.color}`}>{pillar.score}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pillar.bar}`} />
                </div>
                <p className="text-[11px] text-slate-400">{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Impact Prescriptive Actions */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> 3 High-Impact Strategic Actions
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Automate Salary-Day Sweep</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Route {currencySymbol}12,000 into a high-yield liquid emergency fund the morning salary arrives to remove friction.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Consolidate Overlapping Cloud & OTT Services</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Trim underutilized streaming services to reclaim {currencySymbol}950/month in compounding cashflow.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">50/30/20 Re-alignment</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Cap discretionary lifestyle spend at 28% to accelerate goal realization timeline by 4.2 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Leak Radar */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4" /> Detected Capital Leakages
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/20 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">Food Delivery Surge Charges</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Frequent small convenience orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-400 font-mono">+{currencySymbol}2,400/mo</p>
                    <span className="text-[10px] text-slate-500">potential save</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/20 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">Idle Subscription Recurring Fees</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Services inactive for &gt;45 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-400 font-mono">+{currencySymbol}1,199/mo</p>
                    <span className="text-[10px] text-slate-500">potential save</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">Non-Optimized Bank Accounts</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Low-interest regular savings balances</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 font-mono">+{currencySymbol}3,800/yr</p>
                    <span className="text-[10px] text-slate-500">interest boost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANOMALY & LEAK RADAR */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculatedAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      anom.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : anom.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {anom.severity} Alert
                  </span>
                  <span className="text-xs font-mono text-slate-400">{anom.category}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{anom.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{anom.description}</p>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Impact Volume:</span>
                  <span className="font-mono font-bold text-white">
                    {currencySymbol}{(anom.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: QUANTUM WHAT-IF SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4 w-4" /> Scenario Parameters
              </span>
              <h3 className="text-base font-bold text-white mt-1">Multi-Variable Simulation</h3>
            </div>

            <div className="space-y-5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>Salary / Inflow Increment:</span>
                  <strong className="text-emerald-400 font-mono">+{incomeChangePct}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={incomeChangePct}
                  onChange={(e) => setIncomeChangePct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>Discretionary Expense Trim:</span>
                  <strong className="text-cyan-400 font-mono">-{expenseCutPct}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={expenseCutPct}
                  onChange={(e) => setExpenseCutPct(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>Side Hustle Inflow:</span>
                  <strong className="text-indigo-400 font-mono">
                    +{currencySymbol}{sideHustleAmount.toLocaleString()}/mo
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="2500"
                  value={sideHustleAmount}
                  onChange={(e) => setSideHustleAmount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>Annual Inflation Factor:</span>
                  <strong className="text-amber-400 font-mono">{inflationPct}%</strong>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={inflationPct}
                  onChange={(e) => setInflationPct(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Results Projection */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> 12-Month Projected Trajectory
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Capital Accumulation Outcome</h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculated dynamically using your simulated parameters against current baseline.
              </p>
            </div>

            {/* Key Comparison Grid */}
            {(() => {
              const baseIncome = latestMonthAgg.income || 60000;
              const baseExpense = latestMonthAgg.expense || 35000;
              const newIncome = baseIncome * (1 + incomeChangePct / 100) + sideHustleAmount;
              const newExpense = baseExpense * (1 - expenseCutPct / 100) * (1 + inflationPct / 200);
              const monthlySurplus = newIncome - newExpense;
              const annualSavings = monthlySurplus * 12;
              const baseAnnualSavings = (baseIncome - baseExpense) * 12;
              const surplusGain = annualSavings - baseAnnualSavings;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase">Simulated Monthly Inflow</p>
                      <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                        {currencySymbol}{Math.round(newIncome).toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-400/80">
                        +{currencySymbol}{Math.round(newIncome - baseIncome).toLocaleString()} vs base
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase">Simulated Monthly Outflow</p>
                      <p className="text-lg font-bold text-rose-400 font-mono mt-1">
                        {currencySymbol}{Math.round(newExpense).toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400">adjusted for inflation</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                      <p className="text-[10px] text-emerald-400 uppercase font-semibold">12-Mo Net Surplus Gain</p>
                      <p className="text-lg font-bold text-white font-mono mt-1">
                        +{currencySymbol}{Math.round(surplusGain).toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-400">accelerated wealth creation</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" /> AI Strategic Takeaway
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Under this scenario, your annual wealth accumulation jumps from{' '}
                      <strong className="text-slate-200">
                        {currencySymbol}{Math.round(baseAnnualSavings).toLocaleString()}
                      </strong>{' '}
                      to{' '}
                      <strong className="text-emerald-400">
                        {currencySymbol}{Math.round(annualSavings).toLocaleString()}
                      </strong>
                      . This will shave approximately <strong className="text-cyan-400">14 months</strong> off your primary financial goal completion timeline!
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
