import React, { useState, useEffect, useMemo } from 'react';
import { User, Expense, Income, Budget, Goal } from './types';
import { DEMO_USER, generate14MonthsDemoData } from './data/demoData';
import {
  getMonthlyAggregates,
  predictNextMonthExpenses,
  getCurrentMonthStr,
} from './utils/calculations';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { FormsView } from './components/FormsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsView } from './components/BudgetsView';
import { AiForecastView } from './components/AiForecastView';
import { WealthSimulatorView } from './components/WealthSimulatorView';
import { GoalsView } from './components/GoalsView';
import { ImportExportView } from './components/ImportExportView';
import { SettingsView } from './components/SettingsView';
import { FinancialTicker } from './components/FinancialTicker';
import { AiHubView } from './components/AiHubView';
import { ThreeSpatialRadar } from './components/ThreeSpatialRadar';

export function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finsight_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Currency
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem('finsight_currency') || '₹';
  });

  // Financial Data State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('finsight_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return generate14MonthsDemoData(1).expenses;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('finsight_incomes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return generate14MonthsDemoData(1).incomes;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finsight_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return generate14MonthsDemoData(1).budgets;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('finsight_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return generate14MonthsDemoData(1).goals;
  });

  // Active Month
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());

  // Expected Income for AI Predictor boundary test
  const [expectedIncomeOverride, setExpectedIncomeOverride] = useState<number>(0);

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('finsight_user', JSON.stringify(user));
    else localStorage.removeItem('finsight_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finsight_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finsight_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('finsight_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finsight_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finsight_currency', currencySymbol);
  }, [currencySymbol]);

  // Derived Monthly Aggregates
  const monthlyAggregates = useMemo(() => {
    return getMonthlyAggregates(expenses, incomes);
  }, [expenses, incomes]);

  // Derived Machine Learning Forecast
  const mlResult = useMemo(() => {
    return predictNextMonthExpenses(monthlyAggregates, expectedIncomeOverride);
  }, [monthlyAggregates, expectedIncomeOverride]);

  // Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('finsight_user');
  };

  const handleLoadDemo = () => {
    const demo = generate14MonthsDemoData(1);
    setUser(DEMO_USER);
    setExpenses(demo.expenses);
    setIncomes(demo.incomes);
    setBudgets(demo.budgets);
    setGoals(demo.goals);
    setActiveTab('dashboard');
  };

  const handleAddExpense = (dateStr: string, category: string, description: string, amount: number) => {
    const newExp: Expense = {
      id: Date.now(),
      userId: user?.id || 1,
      date: dateStr,
      category,
      description,
      amount,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleAddIncome = (dateStr: string, source: string, amount: number) => {
    const newInc: Income = {
      id: Date.now(),
      userId: user?.id || 1,
      date: dateStr,
      source,
      amount,
    };
    setIncomes((prev) => [newInc, ...prev]);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDeleteIncome = (id: number) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSetBudget = (month: string, category: string, amount: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.month === month && b.category === category);
      if (existing) {
        return prev.map((b) => (b.id === existing.id ? { ...b, budgetAmount: amount } : b));
      } else {
        return [
          ...prev,
          {
            id: Date.now(),
            userId: user?.id || 1,
            month,
            category,
            budgetAmount: amount,
          },
        ];
      }
    });
  };

  const handleAddGoal = (name: string, targetAmount: number, currentAmount: number, deadline?: string) => {
    const newGoal: Goal = {
      id: Date.now(),
      userId: user?.id || 1,
      name,
      targetAmount,
      currentAmount,
      deadline,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoalContribution = (goalId: number, addAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + addAmount } : g))
    );
  };

  const handleImportExpenses = (imported: Array<Omit<Expense, 'id' | 'userId'>>) => {
    const baseId = Date.now();
    const newExpenses: Expense[] = imported.map((item, idx) => ({
      ...item,
      id: baseId + idx,
      userId: user?.id || 1,
    }));
    setExpenses((prev) => [...newExpenses, ...prev]);
  };

  const handleWipeData = () => {
    setExpenses([]);
    setIncomes([]);
    setBudgets([]);
    setGoals([]);
  };

  if (!user) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} onLoadDemo={handleLoadDemo} />;
  }

  const latestMonthAgg = monthlyAggregates[monthlyAggregates.length - 1] || {
    income: 60000,
    expense: 35000,
    savings: 25000,
    savingsRate: 41.6,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar
        user={user}
        currencySymbol={currencySymbol}
        onLogout={handleLogout}
        onOpenDemo={handleLoadDemo}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <FinancialTicker
        savingsRate={latestMonthAgg.savingsRate}
        monthlySurplus={latestMonthAgg.savings}
        currencySymbol={currencySymbol}
      />

      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userName={user.name}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-h-[calc(100vh-85px)]">
          {activeTab === 'dashboard' && (
            <DashboardView
              expenses={expenses}
              incomes={incomes}
              budgets={budgets}
              goals={goals}
              monthlyAggregates={monthlyAggregates}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              currencySymbol={currencySymbol}
              mlResult={mlResult}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'ai_hub' && (
            <AiHubView
              expenses={expenses}
              incomes={incomes}
              budgets={budgets}
              goals={goals}
              monthlyAggregates={monthlyAggregates}
              currencySymbol={currencySymbol}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
            />
          )}

          {activeTab === 'spatial_radar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">3D Spatial Wealth Constellation</h2>
                  <p className="text-xs text-slate-400">
                    Interactive WebGL Three.js spatial model of real-time capital topology, inflow vectors, and goal orbits.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  FPS: 60 | WebGL 2.0
                </div>
              </div>
              <ThreeSpatialRadar
                monthlyIncome={latestMonthAgg.income}
                monthlyExpense={latestMonthAgg.expense}
                currencySymbol={currencySymbol}
                totalGoals={goals.length}
                savingsRate={latestMonthAgg.savingsRate}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              expenses={expenses}
              incomes={incomes}
              currencySymbol={currencySymbol}
              onDeleteExpense={handleDeleteExpense}
              onDeleteIncome={handleDeleteIncome}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'add_expense' && (
            <FormsView
              mode="expense"
              currencySymbol={currencySymbol}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'add_income' && (
            <FormsView
              mode="income"
              currencySymbol={currencySymbol}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              expenses={expenses}
              incomes={incomes}
              monthlyAggregates={monthlyAggregates}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              expenses={expenses}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              currencySymbol={currencySymbol}
              onSetBudget={handleSetBudget}
            />
          )}

          {activeTab === 'ai_forecast' && (
            <AiForecastView
              prediction={mlResult}
              monthlyAggregates={monthlyAggregates}
              currencySymbol={currencySymbol}
              onUpdateExpectedIncome={setExpectedIncomeOverride}
            />
          )}

          {activeTab === 'wealth_simulator' && (
            <WealthSimulatorView currencySymbol={currencySymbol} />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              currencySymbol={currencySymbol}
              onAddGoal={handleAddGoal}
              onUpdateGoalContribution={handleUpdateGoalContribution}
            />
          )}

          {activeTab === 'import_export' && (
            <ImportExportView
              expenses={expenses}
              incomes={incomes}
              budgets={budgets}
              goals={goals}
              onImportExpenses={handleImportExpenses}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              currencySymbol={currencySymbol}
              onUpdateCurrency={setCurrencySymbol}
              onResetDemoData={handleLoadDemo}
              onWipeData={handleWipeData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
