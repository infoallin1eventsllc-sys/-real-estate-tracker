import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  ShieldAlert, 
  Briefcase, 
  Building2,
  Calendar
} from 'lucide-react';
import { FinancialEntry } from '../types';

interface FinancialsViewProps {
  financialHistory: FinancialEntry[];
}

export default function FinancialsView({ financialHistory }: FinancialsViewProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'investor'>('agent');

  // Sum YTDs
  const ytdCommissions = financialHistory.reduce((sum, f) => sum + f.commissionEarned, 0);
  const projectedPipeline = financialHistory[financialHistory.length - 1]?.projectedIncome || 0;
  
  const ytdRentalGross = financialHistory.reduce((sum, f) => sum + f.rentalIncome, 0);
  const averageNOI = financialHistory.reduce((sum, f) => sum + f.noi, 0) / financialHistory.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="financials-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Auditing</h2>
          <p className="text-slate-500 text-sm mt-1">Cross-examine brokerage commissions alongside proprietary investment cash flows.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            id="tab-financials-agent"
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'agent'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Agent Operations</span>
          </button>
          <button
            id="tab-financials-investor"
            onClick={() => setActiveTab('investor')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'investor'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Investor Cash Flow</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs depending on activeTab */}
      {activeTab === 'agent' ? (
        <div id="agent-financials-section" className="space-y-6 animate-fade-in">
          {/* Agent KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">YTD Commissions Earned</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(ytdCommissions)}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                <span>6-month cumulative total</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipeline Projections</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-2">{formatCurrency(projectedPipeline)}</p>
              <div className="flex items-center mt-3 text-xs text-slate-500">
                <span>In-contract + lead commission value</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brokerage Fee Accruals</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(ytdCommissions * 0.15)}</p>
              <div className="flex items-center mt-3 text-xs text-slate-400">
                <span>Estimated 15% brokerage split fee</span>
              </div>
            </div>
          </div>

          {/* Agent Performance Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Monthly Commission Growth</h4>
                <p className="text-xs text-slate-400 mt-0.5">YTD breakdown of closed vs projected deal commission fees.</p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-sm mr-1.5"></span>Earned</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-slate-300 rounded-sm mr-1.5"></span>Projected</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="commissionEarned" name="Earned Commission" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="projectedIncome" name="Projected Commission" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div id="investor-financials-section" className="space-y-6 animate-fade-in">
          {/* Investor KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">YTD Gross Rental Income</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(ytdRentalGross)}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                <span>Rent collected from 18 properties</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">YTD Portfolio NOI</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">{formatCurrency(financialHistory.reduce((sum, f) => sum + f.noi, 0))}</p>
              <div className="flex items-center mt-3 text-xs text-slate-500">
                <span>Weighted Net Operating cash flow</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Operating Margin</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {ytdRentalGross ? ((financialHistory.reduce((sum, f) => sum + f.noi, 0) / ytdRentalGross) * 100).toFixed(1) : 0}%
              </p>
              <div className="flex items-center mt-3 text-xs text-slate-400">
                <span>Cumulative expense load: ~24.5%</span>
              </div>
            </div>
          </div>

          {/* Investor Performance Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Rental Income & Net Cash Flows</h4>
                <p className="text-xs text-slate-400 mt-0.5">Realized rental revenues vs actualized Net Operating Income metrics.</p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5"></span>Gross Rent</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-sm mr-1.5"></span>Net NOI</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNOI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="rentalIncome" name="Gross Rent" stroke="#10b981" fillOpacity={1} fill="url(#colorRent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="noi" name="Net NOI" stroke="#4f46e5" fillOpacity={1} fill="url(#colorNOI)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Financial Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm md:text-base">Monthly Audited Ledgers</h4>
          <p className="text-xs text-slate-400 mt-0.5">Historical financial numbers mapped across the first two quarters of 2026.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Broker Commission Earned</th>
                <th className="px-6 py-3.5">Projected Commissions</th>
                <th className="px-6 py-3.5">Investment Rental Income</th>
                <th className="px-6 py-3.5">Portfolio NOI</th>
                <th className="px-6 py-3.5 text-right">Net Consolidated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {financialHistory.map((entry) => {
                const consolidated = entry.commissionEarned + entry.noi;
                return (
                  <tr key={entry.month} id={`ledger-${entry.month}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{entry.month} 2026</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{formatCurrency(entry.commissionEarned)}</td>
                    <td className="px-6 py-4 text-indigo-600 font-medium">{formatCurrency(entry.projectedIncome)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">{formatCurrency(entry.rentalIncome)}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{formatCurrency(entry.noi)}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">{formatCurrency(consolidated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
