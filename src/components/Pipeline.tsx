import { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import StatusBadge from './StatusBadge';
import { commissionAmount, dealsByStage } from '../utils/calculations';
import type { DealStage } from '../types';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const STAGES: DealStage[] = [
  'Lead',
  'Showing',
  'Offer Made',
  'Under Contract',
  'Closed',
  'Fell Through',
];

export default function Pipeline() {
  const { deals, properties, clients } = useRealEstate();
  const [filter, setFilter] = useState<DealStage | 'All'>('All');

  const filtered = filter === 'All' ? deals : dealsByStage(deals, filter);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STAGES.map((stage) => {
          const count = dealsByStage(deals, stage).length;
          return (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={`rounded-lg border p-3 text-center transition-colors ${
                filter === stage
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stage}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 flex-wrap">
        {(['All', ...STAGES] as (DealStage | 'All')[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Property</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Stage</th>
              <th className="px-5 py-3 text-right">List Price</th>
              <th className="px-5 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No deals in this stage.
                </td>
              </tr>
            ) : (
              filtered.map((deal) => {
                const prop = properties.find((p) => p.id === deal.propertyId);
                const client = clients.find((c) => c.id === deal.clientId);
                return (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{prop?.address ?? '—'}</p>
                      <p className="text-xs text-gray-500">
                        {prop?.city}, {prop?.state}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{client?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={deal.stage} />
                    </td>
                    <td className="px-5 py-3 text-right">{fmt(deal.listPrice)}</td>
                    <td className="px-5 py-3 text-right text-green-700">
                      {fmt(commissionAmount(deal))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
