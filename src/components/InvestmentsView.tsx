import React, { useState } from 'react';
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Percent, 
  ArrowUpRight,
  Calculator,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Property } from '../types';

interface InvestmentsViewProps {
  properties: Property[];
  onToggleStatus?: (id: string, status: Property['status']) => void;
}

export default function InvestmentsView({ properties, onToggleStatus }: InvestmentsViewProps) {
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);

  // We consider properties with owned statuses ('Under Contract', 'Closed', 'Off Market' or custom list) as the active investment portfolio
  const ownedStatuses = ['Under Contract', 'Closed', 'Off Market'];
  const investmentProperties = properties.filter(p => ownedStatuses.includes(p.status) || p.monthlyRent !== undefined);

  // Calculate KPIs
  const totalPortfolioValue = investmentProperties.reduce((sum, p) => sum + (p.purchasePrice || p.price), 0);
  const totalMonthlyRent = investmentProperties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  const totalMonthlyNOI = investmentProperties.reduce((sum, p) => sum + (p.monthlyNOI || 0), 0);
  const totalEquityGain = investmentProperties.reduce((sum, p) => sum + (p.equityGain || 0), 0);
  const averageCapRate = investmentProperties.length > 0 
    ? (investmentProperties.reduce((sum, p) => sum + (p.capRate || 0), 0) / investmentProperties.length) 
    : 0;

  const toggleExpand = (id: string) => {
    setExpandedPropertyId(expandedPropertyId === id ? null : id);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="investments-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Proprietary Investments</h2>
          <p className="text-slate-500 text-sm mt-1">Underwrite and monitor your cash-flowing assets, equity accretion, and capitalization yields.</p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div id="investment-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Asset Value</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalPortfolioValue)}</p>
            <span className="text-[10px] text-slate-500 mt-1 inline-block">Cumulative capital base</span>
          </div>
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Building className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Rent Yield (Mo.)</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalMonthlyRent)}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {(totalPortfolioValue ? (totalMonthlyRent * 12 / totalPortfolioValue * 100) : 0).toFixed(1)}% Gross Yield
            </span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Operating Income (Mo.)</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalMonthlyNOI)}</p>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-flex items-center">
              <Percent className="h-3 w-3 mr-0.5" />
              {averageCapRate.toFixed(1)}% Weighted Cap
            </span>
          </div>
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unrealized Equity Gain</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalEquityGain)}</p>
            <span className="text-[10px] text-slate-500 mt-1 inline-block">Since original acquisition</span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Expandable Properties Rows Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Portfolio Properties Underwriting</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click rows to toggle cash flow pro-forma analysis details.</p>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            {investmentProperties.length} Assets Registered
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {investmentProperties.map((property) => {
            const isExpanded = expandedPropertyId === property.id;
            const currentVal = property.price;
            const originalCost = property.purchasePrice || currentVal * 0.9;
            const equity = property.equityGain || (currentVal - originalCost);
            const capRate = property.capRate || 6.5;
            const gRent = property.monthlyRent || 1500;
            const noi = property.monthlyNOI || 1100;
            
            // Ledger calculations
            const vacancy = Math.round(gRent * 0.05); // 5%
            const management = Math.round(gRent * 0.10); // 10%
            const maintenance = Math.round(gRent * 0.08); // 8%
            const taxInsOpex = Math.round(gRent - vacancy - management - maintenance - noi);

            return (
              <div key={property.id} id={`investment-row-${property.id}`} className="transition-all">
                {/* Expandable Header Row */}
                <div 
                  onClick={() => toggleExpand(property.id)}
                  className="px-6 py-4.5 hover:bg-slate-50/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-indigo-600 shrink-0">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{property.address}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{property.city}, {property.state} • {property.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-left md:text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Purchase Price</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(originalCost)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cap Rate</span>
                      <p className="text-sm font-bold text-indigo-600 mt-0.5">{capRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monthly NOI</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(noi)}</p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end md:space-x-4">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Equity Gain</span>
                        <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{formatCurrency(equity)}</p>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Underwriting Section */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Financial Pro-Forma Ledger */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                        <Calculator className="h-4 w-4 text-slate-400" />
                        <span>Cash Flow Pro-Forma Ledger (Monthly)</span>
                      </h5>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center text-slate-700 font-semibold">
                          <span>Gross Potential Rent (GPR)</span>
                          <span className="text-slate-950">{formatCurrency(gRent)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-4">
                          <span>Vacancy Allowance (5%)</span>
                          <span className="text-rose-600">-{formatCurrency(vacancy)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-4">
                          <span>Management Fees (10%)</span>
                          <span className="text-rose-600">-{formatCurrency(management)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-4">
                          <span>Repairs & Maintenance reserves (8%)</span>
                          <span className="text-rose-600">-{formatCurrency(maintenance)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-4">
                          <span>Taxes, Insurance & OPEX</span>
                          <span className="text-rose-600">-{formatCurrency(taxInsOpex)}</span>
                        </div>
                        <div className="h-px bg-slate-150 my-2"></div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1">
                          <span className="flex items-center">
                            <span>Net Operating Income (NOI)</span>
                            <HelpCircle className="h-3.5 w-3.5 text-slate-400 ml-1 cursor-help" title="Net revenue after operating expenses, excluding debt services." />
                          </span>
                          <span className="text-emerald-600">{formatCurrency(noi)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Investment underwriting notes */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                          Underwriting Notes
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {property.notes || 'No underwriting logs registered. Keep records of renovations, neighborhood developments, or upcoming tenant turnovers to track cash yields.'}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                        <span className="text-slate-400">Yield metric:</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          Cap Rate: {capRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
