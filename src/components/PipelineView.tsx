import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Deal } from '../types';

interface PipelineViewProps {
  deals: Deal[];
  onAddDeal: (deal: Omit<Deal, 'id'>) => void;
  onDeleteDeal: (id: string) => void;
}

export default function PipelineView({ deals, onAddDeal, onDeleteDeal }: PipelineViewProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Buyer' | 'Seller'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Deal Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newStage, setNewStage] = useState<Deal['stage']>('Lead');
  const [newPrice, setNewPrice] = useState('');
  const [newCommRate, setNewCommRate] = useState('3'); // percent
  const [newType, setNewType] = useState<'Buyer' | 'Seller'>('Buyer');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const stages: Deal['stage'][] = ['Lead', 'Showing', 'Offer Made', 'Under Contract', 'Closed', 'Fell Through'];

  // Count deals in each stage
  const getStageCount = (stage: string) => {
    return deals.filter(d => d.stage === stage).length;
  };

  // Stage card colors and styles
  const getStageColor = (stage: string, isActive: boolean) => {
    switch (stage) {
      case 'Lead':
        return isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300';
      case 'Showing':
        return isActive ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-purple-100 hover:border-purple-300';
      case 'Offer Made':
        return isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-500 border-amber-100 hover:border-amber-300';
      case 'Under Contract':
        return isActive ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-100 hover:border-sky-300';
      case 'Closed':
        return isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-100 hover:border-emerald-300';
      case 'Fell Through':
        return isActive ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-rose-100 hover:border-rose-300';
      default:
        return 'bg-white';
    }
  };

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesStage = selectedStage ? deal.stage === selectedStage : true;
    const matchesType = filterType === 'All' ? true : deal.type === filterType;
    const matchesSearch = 
      deal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesType && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newAddress.trim() || !newPrice) return;

    const priceNum = parseFloat(newPrice);
    const commRateNum = parseFloat(newCommRate) / 100;
    
    onAddDeal({
      clientName: newClient,
      propertyAddress: newAddress,
      stage: newStage,
      price: priceNum,
      commissionRate: commRateNum,
      projectedCommission: priceNum * commRateNum,
      date: newDate,
      type: newType
    });

    // Reset Form
    setNewClient('');
    setNewAddress('');
    setNewStage('Lead');
    setNewPrice('');
    setNewCommRate('3');
    setNewType('Buyer');
    setNewDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="pipeline-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deal Pipeline</h2>
          <p className="text-slate-500 text-sm mt-1">Track transacting buyers and sellers across 6 core deal stages.</p>
        </div>
        <button
          id="btn-add-deal"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Deal Entry</span>
        </button>
      </div>

      {/* 6 Stage Counter Tiles */}
      <div id="pipeline-stages-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const count = getStageCount(stage);
          const isActive = selectedStage === stage;
          const styleClasses = getStageColor(stage, isActive);
          
          return (
            <button
              key={stage}
              id={`stage-tile-${stage.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedStage(isActive ? null : stage)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${styleClasses} ${
                isActive ? 'shadow-md scale-102 font-medium' : 'shadow-sm'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{stage}</div>
              <div className="text-2xl font-extrabold mt-1.5">{count}</div>
              <div className="text-[10px] mt-1 opacity-70">
                {isActive ? 'Click to clear filter' : 'Filter by this stage'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters and Search toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            id="pipeline-search"
            placeholder="Search by client or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Client Role:</span>
          {(['All', 'Buyer', 'Seller'] as const).map((type) => (
            <button
              key={type}
              id={`filter-pill-${type.toLowerCase()}`}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 ${
                filterType === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type}s
            </button>
          ))}
          {selectedStage && (
            <button
              id="clear-stage-filter"
              onClick={() => setSelectedStage(null)}
              className="ml-2 text-xs font-semibold text-rose-500 hover:text-rose-600 border border-rose-100 bg-rose-50/50 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shrink-0"
            >
              <span>Stage: {selectedStage}</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Deals Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Pipeline Deals ({filteredDeals.length})</h3>
          <p className="text-xs text-slate-500">Showing filtered brokerage contracts</p>
        </div>

        <div className="overflow-x-auto">
          {filteredDeals.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Property</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Commission Rate</th>
                  <th className="px-6 py-3.5">Estimated Commission</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDeals.map((deal) => {
                  const getBadgeColor = (stage: string) => {
                    switch (stage) {
                      case 'Lead': return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'Showing': return 'bg-purple-50 text-purple-700 border-purple-200';
                      case 'Offer Made': return 'bg-amber-50 text-amber-700 border-amber-200';
                      case 'Under Contract': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'Fell Through': return 'bg-rose-50 text-rose-700 border-rose-200';
                      default: return 'bg-slate-50 text-slate-600 border-slate-200';
                    }
                  };

                  return (
                    <tr key={deal.id} id={`deal-row-${deal.id}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{deal.clientName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{deal.date}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{deal.propertyAddress}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          deal.type === 'Buyer' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {deal.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(deal.price)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{(deal.commissionRate * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(deal.projectedCommission)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-delete-deal-${deal.id}`}
                          onClick={() => onDeleteDeal(deal.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                          title="Delete Deal"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-base text-slate-700">No deals found</p>
              <p className="text-sm text-slate-400 mt-1">Try resetting the stage filter or searches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div id="add-deal-modal" className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Add Pipeline Deal</h3>
              <button 
                id="close-deal-modal"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    required
                    id="deal-input-client"
                    placeholder="e.g. Alice Sterling"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Address</label>
                  <input
                    type="text"
                    required
                    id="deal-input-address"
                    placeholder="e.g. 104 Maple Street"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Role</label>
                  <select
                    id="deal-select-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'Buyer' | 'Seller')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="Buyer">Buyer Client</option>
                    <option value="Seller">Seller Client</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Stage</label>
                  <select
                    id="deal-select-stage"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as Deal['stage'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    required
                    id="deal-input-price"
                    placeholder="350000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    id="deal-input-comm"
                    placeholder="3.0"
                    value={newCommRate}
                    onChange={(e) => setNewCommRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Date</label>
                  <input
                    type="date"
                    required
                    id="deal-input-date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="deal-submit-btn"
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
