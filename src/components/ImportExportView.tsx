import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { Expense, Income, Budget, Goal } from '../types';

interface ImportExportViewProps {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  goals: Goal[];
  onImportExpenses: (imported: Array<Omit<Expense, 'id' | 'userId'>>) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  expenses,
  incomes,
  budgets,
  goals,
  onImportExpenses,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProcessCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setStatusMsg({ type: 'error', text: 'CSV file is empty or missing data rows.' });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      const dateIdx = headers.indexOf('date');
      const catIdx = headers.indexOf('category');
      const descIdx = headers.indexOf('description');
      const amtIdx = headers.indexOf('amount');

      if (dateIdx === -1 || catIdx === -1 || amtIdx === -1) {
        setStatusMsg({
          type: 'error',
          text: 'Invalid CSV schema! Required column headers: Date, Category, Description, Amount.',
        });
        return;
      }

      const parsed: Array<Omit<Expense, 'id' | 'userId'>> = [];

      for (let i = 1; i < lines.length; i++) {
        // Regex for CSV split handling quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const row = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        if (row.length < 3) continue;

        const dateStr = row[dateIdx];
        const categoryStr = row[catIdx];
        const descStr = descIdx !== -1 ? row[descIdx] : '';
        const amtStr = row[amtIdx];

        const amountNum = parseFloat(amtStr);
        if (isNaN(amountNum) || amountNum <= 0) {
          setStatusMsg({
            type: 'error',
            text: `Row ${i + 1}: Amount "${amtStr}" is not a valid positive number.`,
          });
          return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          setStatusMsg({
            type: 'error',
            text: `Row ${i + 1}: Date "${dateStr}" must conform to YYYY-MM-DD format.`,
          });
          return;
        }

        parsed.push({
          date: dateStr,
          category: categoryStr || 'Miscellaneous',
          description: descStr,
          amount: amountNum,
        });
      }

      if (parsed.length === 0) {
        setStatusMsg({ type: 'error', text: 'No valid data rows found in CSV.' });
        return;
      }

      onImportExpenses(parsed);
      setStatusMsg({
        type: 'success',
        text: `Successfully imported ${parsed.length} expense records into your database!`,
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Failed to parse CSV: ${err.message}` });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessCSV(content);
    };
    reader.readAsText(file);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map((e) => `"${e.date}","${e.category}","${e.description || ''}",${e.amount}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `finsight_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Full JSON export
  const handleExportJSON = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      expenses,
      incomes,
      budgets,
      goals,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finsight_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Data Portability & CSV Operations</h2>
        <p className="text-xs text-slate-400">
          Import bulk transactions from spreadsheets or export your database for offline backups.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl p-4 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Import Box */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Import Expenses CSV</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Upload an existing bank or expense CSV. FinSight AI validates required headers and numeric values before committing.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => handleProcessCSV(ev.target?.result as string);
                reader.readAsText(file);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
              dragOver
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            }`}
          >
            <FileSpreadsheet className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-xs font-semibold text-slate-200">Drag & drop your CSV file here</p>
            <p className="text-[10px] text-slate-500 mt-0.5">or click to browse from device</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-3 block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
            />
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-[11px] text-slate-400 space-y-1">
            <strong className="text-slate-300 block">Required Header Format:</strong>
            <code>Date, Category, Description, Amount</code>
            <p className="text-[10px] text-slate-500">Example: 2026-03-12, Food, Lunch with team, 450</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Export & Database Backup</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export your spending records into portable CSV spreadsheets or download an exact JSON backup containing
              incomes, expenses, category budgets, and savings goals.
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Expenses CSV</h4>
                  <p className="text-[10px] text-slate-400">{expenses.length} records ready</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Full JSON Database Dump</h4>
                  <p className="text-[10px] text-slate-400">All tables: expenses, incomes, budgets, goals</p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center gap-1.5"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3 text-[11px] text-slate-400">
            Exported files are formatted for instant compatibility with Excel, Google Sheets, or Python Pandas.
          </div>
        </div>
      </div>
    </div>
  );
};
