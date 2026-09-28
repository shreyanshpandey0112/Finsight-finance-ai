import React from 'react';
import { Sparkles, User as UserIcon, LogOut, Wallet, ShieldCheck, Cpu, Bot } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  currencySymbol: string;
  onLogout: () => void;
  onOpenDemo: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currencySymbol,
  onLogout,
  onOpenDemo,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/85 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
        >
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              onClick={() => onSelectTab && onSelectTab('dashboard')}
              className="text-lg font-extrabold tracking-tight text-white cursor-pointer"
            >
              FinSight <span className="text-emerald-400">AI</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>v3.8 AI Suite</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Intelligent Wealth Architecture & 3D Spatial Analytics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {user ? (
          <>
            {/* Quick Access to AI Neural Hub & 3D Radar */}
            {onSelectTab && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => onSelectTab('ai_hub')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'ai_hub'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>AI Copilot</span>
                </button>

                <button
                  onClick={() => onSelectTab('spatial_radar')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'spatial_radar'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>3D Radar</span>
                </button>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Currency: <strong className="text-white">{currencySymbol}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800/80 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log out"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Demo</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
