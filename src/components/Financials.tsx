import { useRealEstate } from '../context/RealEstateContext';
import {
  totalCommissionEarned,
  projectedCommission,
  totalPipelineValue,
  conversionRate,
  portfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
  totalEquityGain,
  commissionAmount,
} from '../utils/calculations';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function Financials() {
  const { deals, investments, properties } = useRealEstate();
  const closedDeals = deals.filter((d) => d.stage === 'Closed');

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Agent — Commission
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Earned YTD</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {fmt(totalCommissionEarned(deals))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Projected</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {fmt(projectedCommission(deals))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {fmt(totalPipelineValue(deals))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {conversionRate(deals).toFixed(0)}%
            </p>
          </div>
        </div>

        {closedDeals.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Property</th>
                  <th className="px-5 py-3 text-right">Sale Price</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Earned</th>
                  <th className="px-5 py-3 text-left">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closedDeals.map((deal) => {
                  const prop = properties.find((p) => p.id === deal.propertyId);
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {prop?.address ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {fmt(deal.salePrice ?? deal.listPrice)}
                      </td>
                      <td className="px-5 py-3 text-right">{deal.commissionRate}%</td>
                      <td className="px-5 py-3 text-right text-green-700 font-semibold">
                        {fmt(commissionAmount(deal))}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{deal.closingDate ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Investor — Portfolio Returns
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {fmt(portfolioValue(investments))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Monthly Rent</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {fmt(totalMonthlyRent(investments))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Monthly NOI</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {fmt(totalMonthlyNOI(investments))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Total Equity Gain</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {fmt(totalEquityGain(investments))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
