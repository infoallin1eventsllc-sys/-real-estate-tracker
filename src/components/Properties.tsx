import { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import StatusBadge from './StatusBadge';
import type { PropertyStatus } from '../types';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const STATUSES: PropertyStatus[] = [
  'Active',
  'Coming Soon',
  'Under Contract',
  'Closed',
  'Off-Market',
];

export default function Properties() {
  const { properties, clients } = useRealEstate();
  const [filter, setFilter] = useState<PropertyStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = properties.filter((p) => {
    const matchesStatus = filter === 'All' || p.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Properties</h1>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search address, city, neighborhood…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1 flex-wrap">
          {(['All', ...STATUSES] as (PropertyStatus | 'All')[]).map((s) => (
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
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm col-span-2 py-8 text-center">
            No properties match your search.
          </p>
        )}
        {filtered.map((p) => {
          const client = clients.find((c) => c.id === p.clientId);
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{p.address}</p>
                  <p className="text-sm text-gray-500">
                    {p.city}, {p.state} {p.zip}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex gap-4 text-sm text-gray-700 flex-wrap">
                <span>{p.beds} bd</span>
                <span>{p.baths} ba</span>
                <span>{p.sqft.toLocaleString()} sqft</span>
                <span className="font-semibold text-gray-900">{fmt(p.price)}</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {p.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {f}
                  </span>
                ))}
                {p.features.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{p.features.length - 3} more
                  </span>
                )}
              </div>
              {client && (
                <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                  Client: {client.name}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
