import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  DollarSign, 
  Briefcase,
  X,
  UserCheck,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Shield,
  Activity,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Clock,
  Check,
  RotateCcw
} from 'lucide-react';
import { Client, Deal } from '../types';

interface ClientsViewProps {
  clients: Client[];
  deals: Deal[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onDeleteClient: (id: string) => void;
  onUpdateClient?: (client: Client) => void;
}

export default function ClientsView({ clients, deals, onAddClient, onDeleteClient, onUpdateClient }: ClientsViewProps) {
  const [filterRole, setFilterRole] = useState<'All' | 'Buyer' | 'Seller' | 'Both'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Sync selectedClient reference from updated client list state
  const clientToDisplay = selectedClient 
    ? (clients.find(c => c.id === selectedClient.id) || selectedClient)
    : null;

  // Credit Hub & Repair states
  const [activeTab, setActiveTab] = useState<'profile' | 'credit'>('profile');
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);
  const [creditProgressStep, setCreditProgressStep] = useState('');
  const [creditProgressPercent, setCreditProgressPercent] = useState(0);

  // New dispute item form
  const [isAddingDispute, setIsAddingDispute] = useState(false);
  const [disputeCreditor, setDisputeCreditor] = useState('');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [disputeType, setDisputeType] = useState<'Collection' | 'Late Payment' | 'Charge Off' | 'Public Record' | 'Other'>('Collection');
  const [disputeNotes, setDisputeNotes] = useState('');

  // New log entry form
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logAction, setLogAction] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logScoreEffect, setLogScoreEffect] = useState('0');

  useEffect(() => {
    setActiveTab('profile');
  }, [selectedClient?.id]);

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Buyer' | 'Seller' | 'Both'>('Buyer');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filtering
  const filteredClients = clients.filter(client => {
    const matchesRole = filterRole === 'All' ? true : client.role === filterRole || client.role === 'Both';
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  const getClientDeals = (clientName: string) => {
    return deals.filter(d => d.clientName.toLowerCase() === clientName.toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    onAddClient({
      name: newName,
      role: newRole,
      email: newEmail,
      phone: newPhone || '(555) 000-0000',
      budget: newBudget ? parseFloat(newBudget) : 0,
      notes: newNotes || 'No notes added.'
    });

    // Reset Form
    setNewName('');
    setNewRole('Buyer');
    setNewEmail('');
    setNewPhone('');
    setNewBudget('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Interactive Credit Check & Repair Operations
  const handleRunCreditCheck = (client: Client) => {
    if (!onUpdateClient) return;
    setIsCheckingCredit(true);
    setCreditProgressPercent(10);
    setCreditProgressStep('Connecting to credit bureaus (Equifax, Experian, TransUnion)...');

    setTimeout(() => {
      setCreditProgressPercent(40);
      setCreditProgressStep('Scanning active trade lines, credit utilization, and public records...');
    }, 800);

    setTimeout(() => {
      setCreditProgressPercent(75);
      setCreditProgressStep('Analyzing historical payment indicators & compiling score models...');
    }, 1600);

    setTimeout(() => {
      const finalScore = client.creditScore 
        ? Math.min(850, Math.max(300, client.creditScore + Math.floor(Math.random() * 21) - 10))
        : Math.floor(Math.random() * (810 - 540) + 540);

      let finalStatus: Client['creditStatus'] = 'Unchecked';
      if (finalScore >= 740) finalStatus = 'Excellent';
      else if (finalScore >= 670) finalStatus = 'Good';
      else if (finalScore >= 580) finalStatus = 'Fair';
      else finalStatus = 'Requires Repair';

      // Setup some default dispute items if they fall into Requires Repair or In Credit Repair and have none
      const repairItems = (finalScore < 670 && (!client.creditRepairItems || client.creditRepairItems.length === 0)) ? [
        {
          id: 'item-init-1',
          creditor: 'National Recovery Systems',
          amount: 450,
          type: 'Collection' as const,
          status: 'In Progress' as const,
          notes: 'Disputing validity of charge. No validation of debt received.'
        }
      ] : (client.creditRepairItems || []);

      const updatedClient: Client = {
        ...client,
        creditScore: finalScore,
        creditStatus: finalStatus === 'Requires Repair' ? 'Requires Repair' : finalStatus,
        creditRepairItems: repairItems,
        creditRepairHistory: client.creditRepairHistory || []
      };

      onUpdateClient(updatedClient);
      setIsCheckingCredit(false);
      setCreditProgressPercent(0);
      setCreditProgressStep('');
    }, 2400);
  };

  const handleAddDisputeItem = (client: Client) => {
    if (!onUpdateClient || !disputeCreditor.trim()) return;

    const newItem = {
      id: `dispute-${Date.now()}`,
      creditor: disputeCreditor,
      amount: disputeAmount ? parseFloat(disputeAmount) : 0,
      type: disputeType,
      status: 'Disputed' as const,
      notes: disputeNotes || 'No notes added.'
    };

    const updatedClient: Client = {
      ...client,
      creditRepairItems: [...(client.creditRepairItems || []), newItem],
      creditStatus: client.creditStatus === 'Unchecked' || client.creditStatus === 'Excellent' || client.creditStatus === 'Good' || client.creditStatus === 'Fair'
        ? 'In Credit Repair' 
        : client.creditStatus
    };

    onUpdateClient(updatedClient);
    
    // Reset form
    setDisputeCreditor('');
    setDisputeAmount('');
    setDisputeType('Collection');
    setDisputeNotes('');
    setIsAddingDispute(false);
  };

  const handleUpdateDisputeStatus = (client: Client, itemId: string, newStatus: 'Disputed' | 'In Progress' | 'Deleted/Resolved' | 'Verified/Remained') => {
    if (!onUpdateClient) return;

    let scoreBoost = 0;
    let logMessage = '';

    const updatedItems = (client.creditRepairItems || []).map(item => {
      if (item.id === itemId) {
        if (newStatus === 'Deleted/Resolved' && item.status !== 'Deleted/Resolved') {
          scoreBoost = Math.floor(Math.random() * (35 - 15) + 15); // +15 to +35 pts
          logMessage = `Removed ${item.type} dispute from ${item.creditor}. Record deleted successfully!`;
        } else if (newStatus === 'Verified/Remained' && item.status !== 'Verified/Remained') {
          scoreBoost = -5; // slight negative or neutral
          logMessage = `${item.creditor} verified dispute. Item remains on file.`;
        } else {
          logMessage = `Updated ${item.creditor} dispute item status to ${newStatus}.`;
        }
        return { ...item, status: newStatus };
      }
      return item;
    });

    const newScore = scoreBoost !== 0 && client.creditScore 
      ? Math.min(850, Math.max(300, client.creditScore + scoreBoost)) 
      : client.creditScore;

    // determine if all resolved
    const allResolved = updatedItems.length > 0 && updatedItems.every(item => item.status === 'Deleted/Resolved');
    let finalStatus = client.creditStatus;
    if (allResolved) {
      finalStatus = 'Repair Completed';
    } else {
      finalStatus = 'In Credit Repair';
    }

    if (newScore && finalStatus === 'Repair Completed') {
      if (newScore >= 740) finalStatus = 'Excellent';
      else if (newScore >= 670) finalStatus = 'Good';
      else if (newScore >= 580) finalStatus = 'Fair';
    }

    const newHistoryLog = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      score: newScore || 0,
      action: logMessage,
      notes: scoreBoost > 0 ? `Credit FICO score increased by +${scoreBoost} points!` : undefined
    };

    const updatedClient: Client = {
      ...client,
      creditScore: newScore,
      creditStatus: finalStatus,
      creditRepairItems: updatedItems,
      creditRepairHistory: [newHistoryLog, ...(client.creditRepairHistory || [])]
    };

    onUpdateClient(updatedClient);
  };

  const handleAddHistoryLog = (client: Client) => {
    if (!onUpdateClient || !logAction.trim()) return;

    const scoreEffectNum = parseInt(logScoreEffect) || 0;
    const newScore = client.creditScore 
      ? Math.min(850, Math.max(300, client.creditScore + scoreEffectNum))
      : undefined;

    const newHistoryLog = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      score: newScore || client.creditScore || 0,
      action: logAction,
      notes: logNotes || undefined
    };

    const updatedClient: Client = {
      ...client,
      creditScore: newScore,
      creditRepairHistory: [newHistoryLog, ...(client.creditRepairHistory || [])]
    };

    onUpdateClient(updatedClient);

    // Reset Form
    setLogAction('');
    setLogNotes('');
    setLogScoreEffect('0');
    setIsAddingLog(false);
  };

  return (
    <div id="clients-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage active buyer & seller profiles, budgets, and their correlated transaction pipelines.</p>
        </div>
        <button
          id="btn-add-client"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Toolbar: Search + Filter Role */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            id="client-search"
            placeholder="Search clients by name, email, or phone..."
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

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Role Type:</span>
          {(['All', 'Buyer', 'Seller', 'Both'] as const).map((role) => (
            <button
              key={role}
              id={`client-pill-${role.toLowerCase()}`}
              onClick={() => setFilterRole(role)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 ${
                filterRole === role
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {role === 'All' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel layout: Left Table, Right Detail drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Clients Table Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Directory Records ({filteredClients.length})</h3>
            <span className="text-xs text-slate-400">Click row to open details</span>
          </div>

          <div className="overflow-x-auto">
            {filteredClients.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Contact Info</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Credit Score</th>
                    <th className="px-6 py-3.5">Budget/Value</th>
                    <th className="px-6 py-3.5 text-right">Deals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredClients.map((client) => {
                    const clientDeals = getClientDeals(client.name);
                    const isSelected = selectedClient?.id === client.id;
                    
                    return (
                      <tr 
                        key={client.id} 
                        id={`client-row-${client.id}`}
                        onClick={() => setSelectedClient(client)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">{client.name}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{client.email}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{client.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            client.role === 'Buyer' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : client.role === 'Seller' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                          }`}>
                            {client.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {client.creditScore ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-800 text-xs">{client.creditScore}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                client.creditScore >= 740 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                client.creditScore >= 670 ? 'bg-green-50 text-green-700 border border-green-100' :
                                client.creditScore >= 580 ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                                'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                              }`}>
                                {client.creditStatus || 'Checked'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unchecked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {client.budget > 0 ? formatCurrency(client.budget) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {clientDeals.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-700">No clients match filters</p>
                <p className="text-sm text-slate-400 mt-1">Try resetting search text or roles.</p>
              </div>
            )}
          </div>
        </div>

        {/* Drilldown Details Side panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {clientToDisplay ? (
            <div id="client-drilldown-panel" className="flex flex-col h-full animate-fade-in">
              {/* Profile Card Header */}
              <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{clientToDisplay.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 text-[10px] font-bold rounded uppercase ${
                    clientToDisplay.role === 'Buyer' ? 'bg-blue-100 text-blue-800' : clientToDisplay.role === 'Seller' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {clientToDisplay.role} Profile
                  </span>
                </div>
                <button
                  id="btn-delete-client"
                  onClick={() => {
                    onDeleteClient(clientToDisplay.id);
                    setSelectedClient(null);
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  Delete Profile
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Client Bio & Deals
                </button>
                <button
                  onClick={() => setActiveTab('credit')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'credit'
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  <span>Credit Hub</span>
                  {clientToDisplay.creditScore && (
                    <span className={`px-1 rounded text-[9px] font-bold ${
                      clientToDisplay.creditScore >= 670 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {clientToDisplay.creditScore}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content Panel */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[550px]">
                {activeTab === 'profile' ? (
                  <div className="space-y-6">
                    {/* Contacts */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</h4>
                      <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex items-center space-x-3 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate text-slate-600 font-medium">{clientToDisplay.email}</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 font-medium">{clientToDisplay.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">
                            Budget Limit: {clientToDisplay.budget > 0 ? formatCurrency(clientToDisplay.budget) : 'Unrestricted'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Notes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement Notes</h4>
                      <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                        {clientToDisplay.notes}
                      </p>
                    </div>

                    {/* Linked Deals */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Active & Closed Contracts</h4>
                      {getClientDeals(clientToDisplay.name).length > 0 ? (
                        <div className="space-y-2.5">
                          {getClientDeals(clientToDisplay.name).map(deal => (
                            <div key={deal.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{deal.propertyAddress}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{deal.date} • {deal.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-900">{formatCurrency(deal.price)}</p>
                                <span className="inline-block px-1.5 py-0.5 mt-1 text-[9px] font-semibold bg-indigo-50 border border-indigo-100 rounded text-indigo-700">
                                  {deal.stage}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                          <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs font-medium text-slate-500">No deals mapped to this client</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Map client by creating a pipeline deal matching this client name.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Credit Status & Simulation Loading */}
                    {isCheckingCredit ? (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-indigo-600 animate-spin" />
                          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Credit Pull In Progress...</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal font-medium">{creditProgressStep}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${creditProgressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : clientToDisplay.creditScore ? (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className={`h-5 w-5 ${
                              clientToDisplay.creditScore >= 700 ? 'text-emerald-500' : 'text-amber-500'
                            }`} />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bureau Credit Rating</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            clientToDisplay.creditScore >= 740 ? 'bg-emerald-100 text-emerald-800' :
                            clientToDisplay.creditScore >= 670 ? 'bg-green-100 text-green-800' :
                            clientToDisplay.creditScore >= 580 ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {clientToDisplay.creditStatus || 'Checked'}
                          </span>
                        </div>

                        {/* FICO Score Indicator */}
                        <div className="flex items-baseline space-x-2">
                          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{clientToDisplay.creditScore}</span>
                          <span className="text-xs text-slate-400 font-semibold">FICO® Score 8</span>
                        </div>

                        {/* Visual Range bar */}
                        <div className="space-y-1">
                          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-rose-500" style={{ width: '30%' }} />
                            <div className="h-full bg-amber-500" style={{ width: '25%' }} />
                            <div className="h-full bg-green-500" style={{ width: '25%' }} />
                            <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                            <span>300 (Poor)</span>
                            <span>620 (Fair)</span>
                            <span>700 (Good)</span>
                            <span>850 (Excellent)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRunCreditCheck(clientToDisplay)}
                          className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-xl border border-slate-250 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Re-Pull Credit Report</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                        <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl w-fit mx-auto">
                          <Shield className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">No Credit Score On File</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            A credit pre-qualification pull is required before generating pre-approvals or setting up buyer mortgage limits.
                          </p>
                        </div>
                        <button
                          onClick={() => handleRunCreditCheck(clientToDisplay)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-100"
                        >
                          <Activity className="h-3.5 w-3.5" />
                          <span>Run soft-pull Credit Check</span>
                        </button>
                      </div>
                    )}

                    {/* Credit Repair Module (shown if there are dispute items or status is 'Requires Repair'/'In Credit Repair'/'Repair Completed') */}
                    {clientToDisplay.creditScore && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4.5 w-4.5 text-indigo-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Credit Repair Workspace</h4>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 font-bold rounded-lg ${
                            clientToDisplay.creditStatus === 'Repair Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {clientToDisplay.creditStatus === 'Repair Completed' ? 'All Disputes Resolved' : 'Active Repair Plan'}
                          </span>
                        </div>

                        {/* Dispute Items list */}
                        <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden p-4 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Negative Trade Lines & Disputes</h5>
                            <button
                              onClick={() => setIsAddingDispute(!isAddingDispute)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{isAddingDispute ? 'Close' : 'Add Item'}</span>
                            </button>
                          </div>

                          {/* Add Dispute Item Form */}
                          {isAddingDispute && (
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-3 animate-in slide-in-from-top-3 duration-200">
                              <div className="font-bold text-slate-700 mb-1">New Dispute Record</div>
                              
                              <div className="space-y-2.5">
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Creditor Agency Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Apex Debt Recovery"
                                    value={disputeCreditor}
                                    onChange={(e) => setDisputeCreditor(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Disputed Amount ($)</label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 1200"
                                      value={disputeAmount}
                                      onChange={(e) => setDisputeAmount(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Negative Type</label>
                                    <select
                                      value={disputeType}
                                      onChange={(e) => setDisputeType(e.target.value as any)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none"
                                    >
                                      <option value="Collection">Collection</option>
                                      <option value="Late Payment">Late Payment</option>
                                      <option value="Charge Off">Charge Off</option>
                                      <option value="Public Record">Public Record</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Dispute Basis Reason</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Hospital already paid by insurance"
                                    value={disputeNotes}
                                    onChange={(e) => setDisputeNotes(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setIsAddingDispute(false)}
                                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddDisputeItem(clientToDisplay)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                                >
                                  Save Item
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Items List */}
                          {clientToDisplay.creditRepairItems && clientToDisplay.creditRepairItems.length > 0 ? (
                            <div className="space-y-2.5">
                              {clientToDisplay.creditRepairItems.map(item => (
                                <div key={item.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-white border border-slate-150 px-1.5 py-0.5 rounded mr-1.5">
                                        {item.type}
                                      </span>
                                      <span className="text-xs font-bold text-slate-800">{item.creditor}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 italic mt-0.5">"{item.notes}"</p>

                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-slate-400 font-semibold">Bureau Status:</span>
                                    <div className="flex space-x-1">
                                      {(['Disputed', 'In Progress', 'Deleted/Resolved', 'Verified/Remained'] as const).map(st => (
                                        <button
                                          key={st}
                                          onClick={() => handleUpdateDisputeStatus(clientToDisplay, item.id, st)}
                                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                                            item.status === st 
                                              ? st === 'Deleted/Resolved'
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm font-extrabold'
                                                : st === 'Verified/Remained'
                                                  ? 'bg-rose-500 text-white border-rose-500'
                                                  : 'bg-indigo-600 text-white border-indigo-600'
                                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                          }`}
                                        >
                                          {st === 'Deleted/Resolved' ? 'Deleted ✓' : st === 'Verified/Remained' ? 'Remained ✗' : st}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                              <p className="text-xs font-bold text-emerald-800">Clear Credit History</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">No negative collection or late payment items detected.</p>
                            </div>
                          )}
                        </div>

                        {/* Credit Repair Progress Logs */}
                        <div className="bg-white rounded-xl border border-slate-150 p-4 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress Action Logs</h5>
                            <button
                              onClick={() => setIsAddingLog(!isAddingLog)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{isAddingLog ? 'Close' : 'Log Update'}</span>
                            </button>
                          </div>

                          {/* Add Log Form */}
                          {isAddingLog && (
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-250 text-xs space-y-3 animate-in slide-in-from-top-3 duration-200">
                              <div className="font-bold text-slate-700">Record Progress Milestone</div>
                              
                              <div className="space-y-2.5">
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Action Undertaken</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Sent validation of debt request to Equifax"
                                    value={logAction}
                                    onChange={(e) => setLogAction(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Score Effect</label>
                                    <select
                                      value={logScoreEffect}
                                      onChange={(e) => setLogScoreEffect(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none"
                                    >
                                      <option value="0">0 (Neutral)</option>
                                      <option value="5">+5 pts</option>
                                      <option value="15">+15 pts</option>
                                      <option value="25">+25 pts</option>
                                      <option value="-5">-5 pts</option>
                                      <option value="-15">-15 pts</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Extra Notes (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Awaiting Equifax response"
                                      value={logNotes}
                                      onChange={(e) => setLogNotes(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setIsAddingLog(false)}
                                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddHistoryLog(clientToDisplay)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                                >
                                  Add Log
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Logs List */}
                          {clientToDisplay.creditRepairHistory && clientToDisplay.creditRepairHistory.length > 0 ? (
                            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-4.5">
                              {clientToDisplay.creditRepairHistory.map(log => (
                                <div key={log.id} className="relative text-xs space-y-0.5">
                                  {/* Timeline bullet */}
                                  <div className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-indigo-500" />
                                  
                                  <div className="flex items-center justify-between text-slate-400 font-semibold text-[10px]">
                                    <span>{log.date}</span>
                                    {log.score > 0 && (
                                      <span className="font-bold text-slate-600 bg-slate-50 border border-slate-150 px-1 py-0.2 rounded">
                                        FICO: {log.score}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-bold text-slate-800 leading-tight">{log.action}</div>
                                  {log.notes && (
                                    <div className="text-[11px] text-emerald-600 font-medium">{log.notes}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                              <Clock className="h-5 w-5 mx-auto mb-1 text-slate-300" />
                              <p className="text-[10px]">No historical progress logs compiled yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center py-20">
              <Users className="h-12 w-12 text-slate-200 mb-3" />
              <p className="font-semibold text-slate-700 text-sm">No client selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                Select a client record from the list to view their detailed profile bio and transacting properties.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div id="add-client-modal" className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Add New Client</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Full Name</label>
                  <input
                    type="text"
                    required
                    id="client-input-name"
                    placeholder="e.g. Alice Sterling"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    id="client-input-email"
                    placeholder="alice@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Type</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'Buyer' | 'Seller' | 'Both')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Both">Both (Buyer & Seller)</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Limit ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 600000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requirements & Private Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe desired bedrooms, neighborhood, timeline, pre-approval status..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
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
                  id="client-submit-btn"
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
