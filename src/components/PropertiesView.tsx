import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Home, 
  Tag, 
  MapPin, 
  Trash2, 
  X,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { Property } from '../types';

interface PropertiesViewProps {
  properties: Property[];
  onAddProperty: (property: Omit<Property, 'id'>) => void;
  onDeleteProperty: (id: string) => void;
}

export default function PropertiesView({ properties, onAddProperty, onDeleteProperty }: PropertiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Add Property Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('IL');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [type, setType] = useState<Property['type']>('Single Family');
  const [status, setStatus] = useState<Property['status']>('Active');
  const [newFeature, setNewFeature] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>(['Modern Kitchen', 'Central AC']);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [monthlyNOI, setMonthlyNOI] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');

  const statuses: Property['status'][] = ['Active', 'Under Contract', 'Closed', 'Off Market'];
  const types: Property['type'][] = ['Single Family', 'Multi Family', 'Condo', 'Townhouse'];

  // Handle filtering
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus ? property.status === selectedStatus : true;
    const matchesType = selectedType ? property.type === selectedType : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddFeature = () => {
    if (newFeature.trim() && !featuresList.includes(newFeature.trim())) {
      setFeaturesList([...featuresList, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feat: string) => {
    setFeaturesList(featuresList.filter(f => f !== feat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !price || !beds || !baths || !sqft) return;

    const priceNum = parseFloat(price);
    const purchasePriceNum = purchasePrice ? parseFloat(purchasePrice) : priceNum * 0.92;
    const rentNum = monthlyRent ? parseFloat(monthlyRent) : Math.round(priceNum * 0.007);
    const noiNum = monthlyNOI ? parseFloat(monthlyNOI) : Math.round(rentNum * 0.75);
    const capRateValue = parseFloat(((noiNum * 12) / purchasePriceNum * 100).toFixed(1));

    onAddProperty({
      address,
      city,
      state,
      price: priceNum,
      beds: parseInt(beds),
      baths: parseFloat(baths),
      sqft: parseInt(sqft),
      type,
      status,
      features: featuresList,
      monthlyRent: rentNum,
      monthlyNOI: noiNum,
      purchasePrice: purchasePriceNum,
      capRate: capRateValue,
      equityGain: Math.max(0, priceNum - purchasePriceNum),
      notes: notes || 'No additional notes provided.'
    });

    // Reset Form
    setAddress('');
    setCity('');
    setState('IL');
    setPrice('');
    setBeds('');
    setBaths('');
    setSqft('');
    setType('Single Family');
    setStatus('Active');
    setFeaturesList(['Modern Kitchen', 'Central AC']);
    setMonthlyRent('');
    setMonthlyNOI('');
    setPurchasePrice('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Contract':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Off Market':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="properties-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Property Listings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage broker listings and active multi/single-family portfolio structures.</p>
        </div>
        <button
          id="btn-add-property"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Toolbar: Search + Filter Pills */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              id="property-search"
              placeholder="Search by street address, city, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Quick Filters Reset */}
          {(selectedStatus || selectedType) && (
            <button
              id="btn-reset-filters"
              onClick={() => {
                setSelectedStatus(null);
                setSelectedType(null);
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 self-start md:self-auto shrink-0"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-slate-100">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedStatus === null
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Status
              </button>
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    selectedStatus === s
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedType === null
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Types
              </button>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Card Grid */}
      <div id="properties-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <div 
              key={property.id} 
              id={`property-card-${property.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              {/* Card Title Header with Status */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2">
                    {property.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span>{property.address}</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5 ml-6">{property.city}, {property.state}</p>
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900">{formatCurrency(property.price)}</div>
                </div>
              </div>

              {/* Specs & Beds/Baths Section */}
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 gap-4 text-center">
                <div className="border-r border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bedrooms</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{property.beds} Beds</div>
                </div>
                <div className="border-r border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bathrooms</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{property.baths} Baths</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Square Feet</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{property.sqft.toLocaleString()} Sqft</div>
                </div>
              </div>

              {/* Feature tags */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Feature Tag Amenities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {property.features.map((feat) => (
                      <span 
                        key={feat} 
                        className="inline-flex items-center px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
                      >
                        <Tag className="h-3 w-3 mr-1 text-indigo-500" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes and Delete btn */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 italic truncate max-w-[80%]">"{property.notes}"</p>
                  <button
                    id={`btn-delete-property-${property.id}`}
                    onClick={() => onDeleteProperty(property.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors inline-flex shrink-0"
                    title="Remove Property"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-slate-500">
            <Home className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-lg text-slate-700">No matching properties</p>
            <p className="text-sm text-slate-400 mt-1">Try resetting the status/type filters or changing the search text.</p>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div id="add-property-modal" className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Add New Property</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Springfield"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    required
                    placeholder="IL"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Property['type'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Property['status'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">List Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Square Footage</label>
                  <input
                    type="number"
                    required
                    placeholder="2200"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrooms</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="2"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Optional Investment Underwriting</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Monthly Rent Yield ($)</label>
                      <input
                        type="number"
                        placeholder="Leave blank to auto-calculate"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Monthly NOI ($)</label>
                      <input
                        type="number"
                        placeholder="Leave blank to auto-calculate"
                        value={monthlyNOI}
                        onChange={(e) => setMonthlyNOI(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-slate-400">Original Purchase Price ($)</label>
                      <input
                        type="number"
                        placeholder="Leave blank to auto-calculate"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Tags management */}
                <div className="col-span-2 space-y-1 border-t border-slate-100 pt-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features & Amenities</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Fireplace, High Ceilings"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200"
                    >
                      Add Chip
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuresList.map(feat => (
                      <span key={feat} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-100">
                        <span>{feat}</span>
                        <button type="button" onClick={() => handleRemoveFeature(feat)} className="ml-1.5 text-indigo-400 hover:text-indigo-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent/Investor Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Any private notes regarding showings, pricing strategy or rehab..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="property-submit-btn"
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
