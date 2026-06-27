import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Home, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  UserCheck,
  Percent,
  ChevronRight
} from 'lucide-react';
import { Property, Deal } from '../types';
import {
  totalCommissionEarned,
  projectedCommission as calcProjectedCommission,
  totalPipelineValue,
  portfolioValue as calcPortfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
} from '../utils/calculations';

interface DashboardViewProps {
  properties: Property[];
  deals: Deal[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({ properties, deals, onNavigate }: DashboardViewProps) {
  // --- Agent KPI Calculations ---
  const commissionEarned = totalCommissionEarned(deals);
  const projectedCommission = calcProjectedCommission(deals);
  const pipelineValue = totalPipelineValue(deals);
  const activeListingsCount = properties.filter(p => p.status === 'Active').length;

  // --- Investor KPI Calculations ---
  const ownedStatuses = ['Under Contract', 'Closed', 'Off Market'];
  const ownedProperties = properties.filter(p => ownedStatuses.includes(p.status));

  const portfolioValue = calcPortfolioValue(ownedProperties);
  const monthlyRent = totalMonthlyRent(ownedProperties);
  const monthlyNOI = totalMonthlyNOI(ownedProperties);
  const propertiesOwnedCount = ownedProperties.length;

  // Recent deals
  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div id="dashboard-welcome" className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vance Portfolio Hub</h2>
          <p className="text-slate-500 mt-1">Real-time oversight across your client brokerage & investment portfolio.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="h-4.5 w-4.5 text-emerald-500" />
          <span className="text-sm font-medium text-slate-600">June 2026 • Live Update</span>
        </div>
      </div>

      {/* Grid Layout: Agent performance & Investor Portfolio */}
      <div id="dashboard-kpis" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agent Metrics Section */}
        <div id="agent-kpis-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <span>Brokerage Operations (Agent)</span>
            </h3>
            <button 
              id="dash-go-pipeline"
              onClick={() => onNavigate('pipeline')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Manage Deals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* KPI Card 1 */}
            <div id="agent-kpi-earned" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commission Earned</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(commissionEarned)}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                <span>YTD Closed Deals</span>
              </div>
            </div>

            {/* KPI Card 2 */}
            <div id="agent-kpi-projected" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Commission</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(projectedCommission)}</p>
              <div className="flex items-center mt-3 text-xs text-amber-600 font-medium">
                <Clock className="h-3.5 w-3.5 mr-1 shrink-0" />
                <span>In-contract & active deals</span>
              </div>
            </div>

            {/* KPI Card 3 */}
            <div id="agent-kpi-pipeline" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Value</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(pipelineValue)}</p>
              <div className="flex items-center mt-3 text-xs text-slate-500">
                <span>Total transacting volume</span>
              </div>
            </div>

            {/* KPI Card 4 */}
            <div id="agent-kpi-listings" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Listings</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeListingsCount}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium" onClick={() => onNavigate('properties')}>
                <span className="hover:underline cursor-pointer">View active listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investor Portfolio Section */}
        <div id="investor-kpis-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              <span>Proprietary Investments (Investor)</span>
            </h3>
            <button 
              id="dash-go-investments"
              onClick={() => onNavigate('investments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Investment Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* KPI Card 1 */}
            <div id="investor-kpi-portfolio" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Asset Value</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(portfolioValue)}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                <span>Market value of owned assets</span>
              </div>
            </div>

            {/* KPI Card 2 */}
            <div id="investor-kpi-rent" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Rent Income</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(monthlyRent)}</p>
              <div className="flex items-center mt-3 text-xs text-blue-600 font-medium">
                <span>Leased gross monthly rent</span>
              </div>
            </div>

            {/* KPI Card 3 */}
            <div id="investor-kpi-noi" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Net Operating Income (NOI)</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(monthlyNOI)}</p>
              <div className="flex items-center mt-3 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                <span>Operating margin: {portfolioValue ? ((monthlyNOI * 12) / portfolioValue * 100).toFixed(1) : 0}% cap rate avg</span>
              </div>
            </div>

            {/* KPI Card 4 */}
            <div id="investor-kpi-owned" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Properties Owned</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{propertiesOwnedCount}</p>
              <div className="flex items-center mt-3 text-xs text-slate-500">
                <span>Properties in portfolio</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Deal Activity Table */}
      <div id="dashboard-recent-deals" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Deal Activity</h3>
            <p className="text-xs text-slate-500 mt-1">Status of client deals current transacting in pipeline.</p>
          </div>
          <button 
            id="dash-go-pipeline-table"
            onClick={() => onNavigate('pipeline')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <span>View Full Pipeline</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Client & Role</th>
                <th className="px-6 py-3.5">Property Address</th>
                <th className="px-6 py-3.5">Deal Price</th>
                <th className="px-6 py-3.5">Projected Commission</th>
                <th className="px-6 py-3.5">Pipeline Stage</th>
                <th className="px-6 py-3.5 text-right">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentDeals.map((deal) => {
                const getStageBadge = (stage: string) => {
                  switch (stage) {
                    case 'Lead':
                      return 'bg-blue-50 text-blue-700 border border-blue-200';
                    case 'Showing':
                      return 'bg-purple-50 text-purple-700 border border-purple-200';
                    case 'Offer Made':
                      return 'bg-amber-50 text-amber-700 border border-amber-200';
                    case 'Under Contract':
                      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                    case 'Closed':
                      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                    case 'Fell Through':
                      return 'bg-rose-50 text-rose-700 border border-rose-200';
                    default:
                      return 'bg-slate-50 text-slate-700 border border-slate-200';
                  }
                };

                return (
                  <tr key={deal.id} id={`dash-recent-row-${deal.id}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{deal.clientName}</div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${deal.type === 'Buyer' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                        <span>{deal.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{deal.propertyAddress}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">{formatCurrency(deal.price)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">
                      {formatCurrency(deal.projectedCommission)}
                      <span className="text-[10px] text-slate-400 ml-1 font-normal">({deal.commissionRate * 100}%)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStageBadge(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">{deal.date}</td>
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
