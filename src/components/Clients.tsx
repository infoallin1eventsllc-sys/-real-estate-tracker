import { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import StatusBadge from './StatusBadge';
import type { ClientType } from '../types';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const CLIENT_TYPES: ClientType[] = ['Buyer', 'Seller', 'Both'];

export default function Clients() {
  const { clients, deals, properties } = useRealEstate();
  const [filter, setFilter] = useState<ClientType | 'All'>('All');
  const [selected, setSelected] = useState<string | null>(null);

  const selectedClient = selected ? clients.find((c) => c.id === selected) : null;

  if (selectedClient) {
    const clientDeals = deals.filter((d) => d.clientId === selectedClient.id);
    return (
      <div className="p-6 max-w-5xl space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to clients
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
              <p className="text-sm text-gray-500">{selectedClient.email}</p>
              <p className="text-sm text-gray-500">{selectedClient.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                {selectedClient.type}
              </span>
              {selectedClient.budget && (
                <p className="text-sm text-gray-500 mt-2">
                  Budget:{' '}
                  <span className="font-semibold text-gray-800">
                    {fmt(selectedClient.budget)}
                  </span>
                </p>
              )}
              {selectedClient.preApproved && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ Pre-Approved</p>
              )}
            </div>
          </div>
          {selectedClient.notes && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {selectedClient.notes}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Associated Deals</h3>
          <div className="space-y-2">
            {clientDeals.length === 0 ? (
              <p className="text-sm text-gray-400">No deals yet.</p>
            ) : (
              clientDeals.map((d) => {
                const prop = properties.find((p) => p.id === d.propertyId);
                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-900">{prop?.address ?? d.propertyId}</span>
                    <StatusBadge status={d.stage} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  const filtered = clients.filter((c) => filter === 'All' || c.type === filter);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Clients</h1>
      <div className="flex gap-1 mb-4">
        {(['All', ...CLIENT_TYPES] as (ClientType | 'All')[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-right">Budget</th>
              <th className="px-5 py-3 text-left">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelected(c.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-5 py-3 font-medium text-gray-900">
                  {c.name}
                  {c.preApproved && (
                    <span className="ml-2 text-xs text-green-600 font-normal">✓ Pre-approved</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                    {c.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  <p>{c.email}</p>
                  <p>{c.phone}</p>
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {c.budget ? fmt(c.budget) : '—'}
                </td>
                <td className="px-5 py-3 text-gray-500">{c.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
