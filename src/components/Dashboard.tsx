import { useRealEstate } from '../context/RealEstateContext';
import StatusBadge from './StatusBadge';
import {
  totalCommissionEarned,
  projectedCommission,
  totalPipelineValue,
  portfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
} from '../utils/calculations';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function KPICard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { deals, investments, properties } = useRealEstate();
  const activeProps = properties.filter(
    (p) => p.status === 'Active' || p.status === 'Coming Soon',
  );
  const recentDeals = deals.filter(
    (d) => d.stage === 'Closed' || d.stage === 'Under Contract',
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Agent — Deal Activity
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Commission Earned"
            value={fmt(totalCommissionEarned(deals))}
            accent="text-green-700"
          />
          <KPICard
            label="Projected"
            value={fmt(projectedCommission(deals))}
            accent="text-amber-700"
            sub="under contract"
          />
          <KPICard label="Pipeline Value" value={fmt(totalPipelineValue(deals))} sub="active deals" />
          <KPICard label="Active Listings" value={String(activeProps.length)} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Investor — Portfolio
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Portfolio Value" value={fmt(portfolioValue(investments))} />
          <KPICard
            label="Monthly Rent"
            value={fmt(totalMonthlyRent(investments))}
            accent="text-green-700"
          />
          <KPICard
            label="Monthly NOI"
            value={fmt(totalMonthlyNOI(investments))}
            accent="text-blue-700"
          />
          <KPICard label="Properties Owned" value={String(investments.length)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Deal Activity</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-2 text-left">Property</th>
              <th className="px-5 py-2 text-left">Stage</th>
              <th className="px-5 py-2 text-right">List Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentDeals.map((deal) => {
              const prop = properties.find((p) => p.id === deal.propertyId);
              return (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{prop?.address ?? '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={deal.stage} />
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">{fmt(deal.listPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
