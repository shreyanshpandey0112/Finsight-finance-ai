import React, { useState } from 'react';
import { TrendingUp, Coins, Sparkles, AlertCircle, ArrowUpRight, Scale } from 'lucide-react';
import { calculateFutureValue, formatINR } from '../utils/calculations';

interface WealthSimulatorViewProps {
  currencySymbol: string;
}

export const WealthSimulatorView: React.FC<WealthSimulatorViewProps> = ({ currencySymbol }) => {
  const [principal, setPrincipal] = useState<number>(25000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [years, setYears] = useState<number>(10);

  // Calculate Primary Investment (e.g. 10% or user chosen)
  const result = calculateFutureValue(principal, monthlyContribution, annualRate, years);

  // Calculate Conservative Cash / Normal Bank Account (3% return)
  const cashResult = calculateFutureValue(principal, monthlyContribution, 3, years);

  const difference = result.futureValue - cashResult.futureValue;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Compound Wealth Growth Simulator</h2>
          <p className="text-xs text-slate-400">
            Interactive mathematical projection of long-term compounding using Future Value annuity formulas.
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>FV Compound Annuity Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Controls & Inputs */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white">Investment Parameters</h3>

          {/* Initial Principal */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Initial Starting Capital:</span>
              <strong className="text-white font-mono">{formatINR(principal, currencySymbol)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{currencySymbol}0</span>
              <span>{currencySymbol}2,00,000</span>
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Monthly Investment Deposit:</span>
              <strong className="text-white font-mono">{formatINR(monthlyContribution, currencySymbol)}</strong>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{currencySymbol}500/mo</span>
              <span>{currencySymbol}50,000/mo</span>
            </div>
          </div>

          {/* Expected Annual Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Expected Annual Return (CAGR):</span>
              <strong className="text-emerald-400 font-mono">{annualRate}% p.a.</strong>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1% (Inflation)</span>
              <span>12% (Index)</span>
              <span>24% (Aggressive)</span>
            </div>
          </div>

          {/* Time Horizon (Years) */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Investment Horizon:</span>
              <strong className="text-white font-mono">{years} Years ({years * 12} Months)</strong>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Mathematical Formula Preview */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Formula Implemented:</span>
            <p className="font-mono text-cyan-300 text-[11px] leading-snug">
              FV = P(1+r)ⁿ + PMT × [((1+r)ⁿ - 1) / r]
            </p>
          </div>
        </div>

        {/* Results & Growth Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs text-slate-400">Total Money Contributed</span>
              <p className="text-xl font-extrabold text-white mt-1">
                {formatINR(result.totalContributions, currencySymbol)}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Principal + {years * 12} monthly deposits</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs text-slate-400">Estimated Compound Growth</span>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">
                +{formatINR(result.totalGrowth, currencySymbol)}
              </p>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Wealth generated purely via interest</span>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/80 p-4">
              <span className="text-xs text-cyan-300 font-medium">Final Projected Wealth (FV)</span>
              <p className="text-2xl font-black text-white mt-1">
                {formatINR(result.futureValue, currencySymbol)}
              </p>
              <span className="text-[10px] text-cyan-300/80 mt-1 block">At end of Year {years}</span>
            </div>
          </div>

          {/* Comparative Simulation: Cash vs Investment */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Comparative Analysis: Cash (3%) vs Investment ({annualRate}%)</h3>
            </div>

            <p className="text-xs text-slate-400">
              Shows the difference between holding surplus in a traditional savings account versus investing in an index or diversified fund.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-300">Traditional Cash Savings (3% p.a.)</span>
                </div>
                <p className="text-xl font-black text-slate-300">{formatINR(cashResult.futureValue, currencySymbol)}</p>
                <span className="text-[10px] text-slate-400">Interest earned: {formatINR(cashResult.totalGrowth, currencySymbol)}</span>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-emerald-400">Diversified Investment ({annualRate}% p.a.)</span>
                </div>
                <p className="text-xl font-black text-emerald-300">{formatINR(result.futureValue, currencySymbol)}</p>
                <span className="text-[10px] text-emerald-400">
                  Advantage: +{formatINR(difference, currencySymbol)} extra wealth
                </span>
              </div>
            </div>
          </div>

          {/* Visual Year-by-Year Compound Chart */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Yearly Compounding Curve</h3>
                <p className="text-[11px] text-slate-400">Cumulative balance progression over {years} years</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-600" />
                  <span className="text-slate-400">Contributed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-emerald-400">Compound Value</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full flex items-end gap-1.5 pt-4">
              {(() => {
                const maxVal = result.futureValue || 1;
                return result.yearlyBreakdown.map((item) => {
                  const balHeight = Math.round((item.balance / maxVal) * 160);
                  const contribHeight = Math.round((item.contributed / maxVal) * 160);

                  return (
                    <div key={item.year} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-0.5 h-44">
                        <div
                          style={{ height: `${contribHeight}px` }}
                          className="w-1/2 rounded-t-sm bg-slate-700/80 group-hover:bg-slate-600 transition"
                          title={`Contributed: ${formatINR(item.contributed, currencySymbol)}`}
                        />
                        <div
                          style={{ height: `${balHeight}px` }}
                          className="w-1/2 rounded-t-sm bg-emerald-500/90 group-hover:bg-emerald-400 transition"
                          title={`Total Value: ${formatINR(item.balance, currencySymbol)}`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 truncate">Y{item.year}</span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Mandatory Educational Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
              <span>
                Simulations are mathematical estimates for educational purposes and do not guarantee future market returns.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
