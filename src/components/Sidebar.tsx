import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BadgeIndianRupee,
  BarChart3,
  Target,
  Bot,
  TrendingUp,
  Flag,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sparkles,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userName: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, userName, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai_hub', label: 'AI Neural Hub', icon: Sparkles, badge: 'GEN-AI' },
    { id: 'spatial_radar', label: '3D Spatial Radar', icon: Cpu, badge: '3D' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'add_expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'add_income', label: 'Add Income', icon: BadgeIndianRupee },
    { id: 'analytics', label: 'Expense Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'ai_forecast', label: 'AI Forecast', icon: Bot, badge: 'ML' },
    { id: 'wealth_simulator', label: 'Wealth Simulator', icon: TrendingUp },
    { id: 'goals', label: 'Financial Goals', icon: Flag },
    { id: 'import_export', label: 'Import / Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div className="px-2 py-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-900 space-y-2">
        <div className="px-2">
          <p className="text-[10px] text-slate-400">Active User</p>
          <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
