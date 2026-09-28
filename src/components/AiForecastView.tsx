import React, { useState } from 'react';
import {
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Layers,
  Cpu,
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon,
  Info,
} from 'lucide-react';
import { PredictionResult, MonthlyAggregate } from '../types';
import { formatINR } from '../utils/calculations';

interface AiForecastViewProps {
  prediction: PredictionResult;
  monthlyAggregates: MonthlyAggregate[];
  currencySymbol: string;
  onUpdateExpectedIncome: (income: number) => void;
}

export const AiForecastView: React.FC<AiForecastViewProps> = ({
  prediction,
  monthlyAggregates,
  currencySymbol,
  onUpdateExpectedIncome,
}) => {
  const [testIncome, setTestIncome] = useState(prediction.expectedIncome || 55000);
  const [chartMode, setChartMode] = useState<'bars' | 'curve'>('bars');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleIncomeChange = (val: number) => {
    setTestIncome(val);
    onUpdateExpectedIncome(val);
  };

  const isInsufficient = prediction.status === 'insufficient_data';
  const comparison = (prediction.historicalComparison || []).filter((h) => h && h.month);

  // Find max value across actual, fitted, and predicted with bulletproof numeric validation
  const safeMaxVal = Math.max(
    ...comparison.map((h) => Math.max(Number(h?.actual) || 0, Number(h?.fittedTrend) || 0)),
    Number(prediction?.predictedExpense) || 0,
    100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Expense Predictor</h2>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              OLS Regression Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervised time-series forecasting with feature engineering and dynamic budget risk analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          <span className="text-slate-400">Sample Depth:</span>
          <strong className="text-emerald-400">{monthlyAggregates.length} months history</strong>
        </div>
      </div>

      {isInsufficient ? (
        /* Guard message if fewer than 3 months of data */
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center max-w-xl mx-auto space-y-4 backdrop-blur-md">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">Insufficient Historical Data</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {prediction.message}
          </p>
          <div className="rounded-xl bg-slate-950/60 p-3 text-[11px] text-slate-400 border border-slate-800">
            Currently available: <strong className="text-white">{monthlyAggregates.length} months</strong>. Required minimum: <strong className="text-emerald-400">3 months</strong>.
          </div>
        </div>
      ) : (
        <>
          {/* Main Forecast Result Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Next Month Machine Learning Projection
                </span>
                <span className="text-[11px] text-slate-400">Trained on {monthlyAggregates.length} monthly epochs</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatINR(prediction.predictedExpense, currencySymbol)}
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    prediction.trendDirection === 'down'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : prediction.trendDirection === 'up'
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {prediction.trendDirection === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                  ) : prediction.trendDirection === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                  ) : null}
                  <span>
                    {prediction.percentageChange >= 0 ? '+' : ''}
                    {prediction.percentageChange}% vs previous month
                  </span>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Prediction Rationale & Momentum
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{prediction.explanation}</p>
              </div>

              {/* Overspending Notice */}
              {prediction.overspendingWarning ? (
                <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 text-xs text-rose-200 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-300 font-bold mb-0.5">Overspending Risk Warning</strong>
                    <p className="leading-snug">{prediction.overspendingMessage}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-300 font-bold mb-0.5">Budget Health Safe</strong>
                    <p className="leading-snug">
                      Projected expenditure is comfortably sustainable within expected monthly earnings.
                    </p>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>AI forecast estimate based on your historical patterns.</span>
                <span>Self-contained analytical model.</span>
              </div>
            </div>

            {/* Income Simulation Slider (What-if scenario) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Expected Income Boundary</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Adjust anticipated monthly income to evaluate if your forecasted spending remains sustainable.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Expected Income:</span>
                      <strong className="text-white font-mono">{formatINR(testIncome, currencySymbol)}</strong>
                    </div>
                    <input
                      type="range"
                      min="15000"
                      max="150000"
                      step="2500"
                      value={testIncome}
                      onChange={(e) => handleIncomeChange(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>{currencySymbol}15,000</span>
                      <span>{currencySymbol}1,50,000</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Forecasted Spend:</span>
                      <span className="text-white font-mono">
                        {formatINR(prediction.predictedExpense, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Projected Net Surplus:</span>
                      <span
                        className={`font-mono font-bold ${
                          testIncome - prediction.predictedExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatINR(testIncome - prediction.predictedExpense, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>Simulates surplus margin under varying salary scenarios.</span>
              </div>
            </div>
          </div>

          {/* Model Fit vs Actuals Comparison Chart */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Historical Spending vs Regression Model Fit</h3>
                <p className="text-[11px] text-slate-400">
                  Actual recorded outlays compared with machine-learned regression trajectory
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Visual Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-emerald-500" />
                    <span className="text-slate-300 font-medium">Actual Monthly Outlay</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-indigo-500" />
                    <span className="text-slate-300 font-medium">Model Fitted Trend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                    <span className="text-violet-300 font-medium">Next Forecast (t+1)</span>
                  </div>
                </div>

                {/* View Switcher */}
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => setChartMode('bars')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      chartMode === 'bars'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Bar Comparison</span>
                  </button>
                  <button
                    onClick={() => setChartMode('curve')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      chartMode === 'curve'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                    <span>Trend Trajectory</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hover Tooltip Box */}
            {hoveredIndex !== null && comparison[hoveredIndex] && (
              <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-3 text-xs flex flex-wrap items-center gap-6 shadow-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Period</span>
                  <strong className="text-white">{comparison[hoveredIndex].month}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">Actual Spend</span>
                  <strong className="text-white font-mono">
                    {formatINR(comparison[hoveredIndex].actual, currencySymbol)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 block">Fitted Model Value</span>
                  <strong className="text-white font-mono">
                    {formatINR(comparison[hoveredIndex].fittedTrend, currencySymbol)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Variance</span>
                  <strong className="text-slate-200 font-mono">
                    {formatINR(
                      Math.abs(comparison[hoveredIndex].actual - comparison[hoveredIndex].fittedTrend),
                      currencySymbol
                    )}
                  </strong>
                </div>
              </div>
            )}

            {/* Chart Area */}
            {chartMode === 'bars' ? (
              <div className="h-64 w-full flex items-end gap-2 pt-6 border-b border-slate-800 pb-2">
                {comparison.map((item, idx) => {
                  const actualVal = Number(item.actual) || 0;
                  const fitVal = Number(item.fittedTrend) || 0;
                  const actualHeight = Math.max(4, Math.round((actualVal / safeMaxVal) * 190));
                  const fitHeight = Math.max(4, Math.round((fitVal / safeMaxVal) * 190));

                  return (
                    <div
                      key={item.month}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-48">
                        {/* Actual Outlay: Calm Emerald Bar */}
                        <div
                          style={{ height: `${actualHeight}px` }}
                          className="w-1/2 min-w-[6px] max-w-[18px] rounded-t-md bg-gradient-to-t from-emerald-600/90 to-emerald-400/90 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-sm"
                          title={`Actual: ${formatINR(actualVal, currencySymbol)}`}
                        />
                        {/* Model Fitted Trend: Cool Indigo Bar */}
                        <div
                          style={{ height: `${fitHeight}px` }}
                          className="w-1/2 min-w-[6px] max-w-[18px] rounded-t-md bg-gradient-to-t from-indigo-600/80 to-indigo-400/80 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all shadow-sm"
                          title={`Model Fit: ${formatINR(fitVal, currencySymbol)}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-full font-mono group-hover:text-white">
                        {item.month.split('-')[1]}
                      </span>
                    </div>
                  );
                })}

                {/* Next Month Predicted Target Bar */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-48">
                    <div
                      style={{
                        height: `${Math.max(
                          4,
                          Math.round(((Number(prediction.predictedExpense) || 0) / safeMaxVal) * 190)
                        )}px`,
                      }}
                      className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-400 shadow-lg shadow-violet-500/20 border-t-2 border-fuchsia-300 animate-pulse transition"
                      title={`Forecasted: ${formatINR(Number(prediction.predictedExpense) || 0, currencySymbol)}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-violet-400 truncate max-w-full">Next (t+1)</span>
                </div>
              </div>
            ) : (
              /* Continuous SVG Line & Trajectory Curve */
              <div className="h-64 w-full relative pt-4 border-b border-slate-800 pb-2">
                <svg viewBox="0 0 800 200" className="w-full h-48 overflow-visible">
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                    <line
                      key={ratio}
                      x1="20"
                      y1={Math.round(190 - ratio * 160)}
                      x2="780"
                      y2={Math.round(190 - ratio * 160)}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* SVG Area & Lines */}
                  {(() => {
                    const count = comparison.length;
                    const totalSteps = Math.max(count, 1);
                    const stepX = 720 / totalSteps;

                    // Build points for actual spend
                    const actualCoords = comparison.map((item, i) => {
                      const act = Number(item?.actual) || 0;
                      const rawX = Math.round(30 + i * stepX);
                      const rawY = Math.round(185 - (act / safeMaxVal) * 160);
                      const x = Number.isFinite(rawX) ? rawX : 30;
                      const y = Number.isFinite(rawY) ? Math.min(185, Math.max(15, rawY)) : 185;
                      return { x, y, item, idx: i };
                    });

                    // Build points for fitted spend
                    const fittedCoords = comparison.map((item, i) => {
                      const fit = Number(item?.fittedTrend) || 0;
                      const rawX = Math.round(30 + i * stepX);
                      const rawY = Math.round(185 - (fit / safeMaxVal) * 160);
                      const x = Number.isFinite(rawX) ? rawX : 30;
                      const y = Number.isFinite(rawY) ? Math.min(185, Math.max(15, rawY)) : 185;
                      return { x, y };
                    });

                    // Forecast Point
                    const predVal = Number(prediction?.predictedExpense) || 0;
                    const rawNextX = Math.round(30 + count * stepX);
                    const rawNextY = Math.round(185 - (predVal / safeMaxVal) * 160);
                    const nextX = Number.isFinite(rawNextX) ? Math.min(780, rawNextX) : 750;
                    const nextY = Number.isFinite(rawNextY) ? Math.min(185, Math.max(15, rawNextY)) : 185;

                    const actualPath =
                      actualCoords.length > 0
                        ? actualCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                        : 'M 30 185 L 750 185';

                    const lastX = actualCoords.length > 0 ? actualCoords[actualCoords.length - 1].x : 750;
                    const areaPath =
                      actualCoords.length > 0 ? `${actualPath} L ${lastX} 185 L 30 185 Z` : '';

                    const fittedPath =
                      fittedCoords.length > 0
                        ? fittedCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
                          ` L ${nextX} ${nextY}`
                        : `M 30 185 L ${nextX} ${nextY}`;

                    return (
                      <>
                        {/* Area fill */}
                        {areaPath && <path d={areaPath} fill="url(#actualGradient)" />}

                        {/* Fitted Line (Dashed Indigo) */}
                        <path
                          d={fittedPath}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                        />

                        {/* Actual Outlay Line (Solid Emerald) */}
                        <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="3" />

                        {/* Actual Data Nodes */}
                        {actualCoords.map((pt) => (
                          <circle
                            key={pt.idx}
                            cx={String(pt.x)}
                            cy={String(pt.y)}
                            r={hoveredIndex === pt.idx ? 6 : 4}
                            fill="#10b981"
                            stroke="#0f172a"
                            strokeWidth={2}
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredIndex(pt.idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        ))}

                        {/* Next Forecast Target Point */}
                        <circle
                          cx={String(nextX)}
                          cy={String(nextY)}
                          r={7}
                          fill="#c084fc"
                          stroke="#ffffff"
                          strokeWidth={2.5}
                          className="animate-pulse"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* X-axis Labels */}
                <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-2 font-mono">
                  {comparison.map((item) => (
                    <span key={item.month}>{item.month.split('-')[1]}</span>
                  ))}
                  <span className="font-bold text-violet-400">Next (t+1)</span>
                </div>
              </div>
            )}
          </div>

          {/* Model Features Breakdown & Equation */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Under the Hood: Feature Weights & Equation</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The regression equation is formulated as:{' '}
              <code className="text-emerald-300 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                ŷ = β₀ + β₁(Month) + β₂(Previous_Spend) + β₃(3Mo_Avg) + β₄(Income)
              </code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Month Number (t)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  β₁ = {prediction.coefficients?.monthNumber ?? 0.05}
                </span>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Captures chronological progression</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Lag-1 Spend (t-1)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  β₂ = {prediction.coefficients?.previousMonthSpend ?? 0.35}
                </span>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Autoregressive momentum</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">3-Month Moving Average</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  β₃ = {prediction.coefficients?.threeMonthAverage ?? 0.45}
                </span>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Smooths short-term fluctuations</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Model Intercept (β₀)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  β₀ = {prediction.intercept ?? 4500}
                </span>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Baseline fixed living costs</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
