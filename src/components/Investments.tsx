import { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import StatusBadge from './StatusBadge';
import {
  calcMonthlyNOI,
  calcCapRate,
  calcEquity,
  portfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
  totalEquityGain,
} from '../utils/calculations';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function Investments() {
  const { investments } = useRealEstate();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(portfolioValue(investments))}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{fmt(totalMonthlyRent(investments))}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly NOI</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{fmt(totalMonthlyNOI(investments))}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Equity Gain</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalEquityGain(investments))}</p>
        </div>
      </div>

      <div className="space-y-3">
        {investments.map((inv) => {
          const isOpen = expanded === inv.id;
          const noi = calcMonthlyNOI(inv);
          const equity = calcEquity(inv);

          return (
            <div key={inv.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : inv.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{inv.address}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {inv.city}, {inv.state} · {inv.type}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={inv.occupancyStatus} />
                  <span className="text-sm font-medium text-gray-700">{fmt(inv.currentValue)}</span>
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Monthly Rent</p>
                      <p className="font-semibold text-green-700 mt-0.5">{fmt(inv.monthlyRent)}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Monthly NOI</p>
                      <p className={`font-semibold mt-0.5 ${noi >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                        {fmt(noi)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Cap Rate</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {calcCapRate(inv).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Equity Gain</p>
                      <p className={`font-semibold mt-0.5 ${equity >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {fmt(equity)}
                      </p>
                    </div>
                  </div>
                  {inv.tenantName && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tenant:</span> {inv.tenantName}
                      {inv.leaseEnd && (
                        <span className="ml-2 text-gray-400">· Lease ends {inv.leaseEnd}</span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Purchased {fmt(inv.purchasePrice)} on {inv.purchaseDate} · Mortgage{' '}
                    {fmt(inv.mortgagePayment)}/mo
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
