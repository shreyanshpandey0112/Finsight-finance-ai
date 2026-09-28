import React from 'react';
import { TrendingUp, TrendingDown, Cpu, Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface FinancialTickerProps {
  savingsRate?: number;
  monthlySurplus?: number;
  currencySymbol?: string;
}

export const FinancialTicker: React.FC<FinancialTickerProps> = ({
  savingsRate = 41.5,
  monthlySurplus = 27000,
  currencySymbol = '₹',
}) => {
  const tickerItems = [
    { label: 'AI HEALTH', val: '92/100 (AAA)', trend: 'up', color: 'text-emerald-400' },
    { label: 'NET SURPLUS', val: `${currencySymbol}${monthlySurplus.toLocaleString()}`, trend: 'up', color: 'text-emerald-400' },
    { label: 'SAVINGS VELOCITY', val: `${savingsRate}%`, trend: 'up', color: 'text-cyan-400' },
    { label: 'NIFTY 50', val: '24,842.15 (+0.45%)', trend: 'up', color: 'text-emerald-400' },
    { label: 'S&P 500', val: '5,864.20 (+0.38%)', trend: 'up', color: 'text-emerald-400' },
    { label: 'NASDAQ', val: '18,485.60 (+0.72%)', trend: 'up', color: 'text-emerald-400' },
    { label: 'GOLD (10g)', val: `${currencySymbol}76,420 (-0.12%)`, trend: 'down', color: 'text-rose-400' },
    { label: 'BITCOIN', val: '$68,450 (+2.15%)', trend: 'up', color: 'text-emerald-400' },
    { label: 'RBI REPO RATE', val: '6.50% (Neutral)', trend: 'flat', color: 'text-slate-400' },
    { label: 'CPI INFLATION', val: '4.85% (Targeted)', trend: 'flat', color: 'text-slate-400' },
    { label: 'AI MODEL', val: 'Gemini 3.8 Flash + OLS', trend: 'up', color: 'text-indigo-400' },
  ];

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800/80 overflow-hidden py-1.5 px-4 text-[11px] font-mono select-none">
      <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar animate-none">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="uppercase tracking-wider text-[10px]">LIVE RADAR</span>
        </div>

        {tickerItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-semibold">{item.label}:</span>
            <span className={`font-medium ${item.color}`}>{item.val}</span>
            {item.trend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />}
            {item.trend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-rose-400" />}
            <span className="text-slate-700 ml-2">/</span>
          </div>
        ))}
      </div>
    </div>
  );
};
