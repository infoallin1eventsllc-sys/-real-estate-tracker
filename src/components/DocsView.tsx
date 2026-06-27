import React, { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, ExternalLink, ShieldAlert, FileEdit, User, Home } from 'lucide-react';
import { Client, Property } from '../types';

interface DocsViewProps {
  user: any;
  accessToken: string | null;
  clients: Client[];
  properties: Property[];
  onLogin: () => void;
}

interface GoogleDoc {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export default function DocsView({ user, accessToken, clients, properties, onLogin }: DocsViewProps) {
  const [docs, setDocs] = useState<GoogleDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  // Load recently created docs from Google Drive
  const fetchDocs = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,webViewLink,modifiedTime)&orderBy=modifiedTime desc&pageSize=5`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('Failed to list Google Docs');
      const data = await response.json();
      setDocs(data.files || []);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Could not connect to Google Drive API. Please check permissions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDocs();
    }
  }, [accessToken]);

  // Draft professional real estate purchase proposal doc
  const handleDraftProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedPropertyId || !offerPrice) {
      setStatusMessage({ type: 'error', text: 'Please select a Client, Property, and offer price.' });
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    const property = properties.find(p => p.id === selectedPropertyId);

    if (!client || !property) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to create a new purchase contract in Google Docs named "OFFER_AGREEMENT_${client.name.replace(/\s+/g, '_')}"?`
    );
    if (!confirmed) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const docTitle = `OFFER_AGREEMENT_${client.name.replace(/\s+/g, '_')}_${property.address.replace(/\s+/g, '_')}`;

      // 1. Create empty Document
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: docTitle }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(errText || 'Failed to create document');
      }

      const docData = await createRes.json();
      const documentId = docData.documentId;

      // 2. Format beautiful real estate document via batchUpdate
      const templateText = `REAL ESTATE PURCHASE OFFER AGREEMENT\n\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Property Address: ${property.address}, ${property.city}, ${property.state}\n` +
        `Listing Price: $${property.price.toLocaleString()}\n\n` +
        `PURCHASER DETAILS:\n` +
        `Name: ${client.name}\n` +
        `Email: ${client.email}\n` +
        `Phone: ${client.phone}\n\n` +
        `OFFER DETAILS:\n` +
        `Offered Purchase Price: $${Number(offerPrice).toLocaleString()}\n` +
        `Earnest Money Deposit: $${(Number(offerPrice) * 0.01).toLocaleString()} (1% of offer)\n` +
        `Target Closing Date: 30 days from agreement\n\n` +
        `TERMS AND CONDITIONS:\n` +
        `1. Financing contingency is active based on buyer pre-qualification.\n` +
        `2. Standard home inspection contingency applies.\n` +
        `3. Broker commissions will be disbursed as specified in exclusive listing contracts.\n\n` +
        `Broker Signature: Jordan Vance, ApexEstate\n`;

      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: templateText,
              },
            },
          ],
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update contract text inside Google Doc.');
      }

      const viewLink = `https://docs.google.com/documents/d/${documentId}/edit`;
      setStatusMessage({
        type: 'success',
        text: `Successfully drafted offer contract for ${client.name}!`,
        link: viewLink,
      });

      setSelectedClientId('');
      setSelectedPropertyId('');
      setOfferPrice('');
      fetchDocs();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred while creating document.' });
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div id="docs-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <FileText className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Docs Drafting</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Instantly draft professional offers and contract agreements directly into Google Documents using active property parameters and client details.
        </p>
        <button 
          onClick={onLogin}
          className="gsi-material-button w-full"
        >
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">Sign in with Google</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div id="docs-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Draft Document Form */}
      <div id="docs-draft-column" className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
        <div className="flex items-center space-x-2.5 mb-5 border-b border-slate-800 pb-3">
          <FileEdit className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">Draft Contract Agreement</h3>
        </div>

        {statusMessage && (
          <div className={`p-4 mb-4 rounded-xl border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            <div className="flex items-start space-x-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-medium">{statusMessage.text}</p>
                {statusMessage.link && (
                  <a 
                    href={statusMessage.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 mt-2 px-3 py-1 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    <span>Open in Google Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleDraftProposal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Client Profile</label>
            <div className="relative">
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm appearance-none cursor-pointer"
              >
                <option value="">-- Choose client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
              <User className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Target Property</label>
            <div className="relative">
              <select
                value={selectedPropertyId}
                onChange={e => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm appearance-none cursor-pointer"
              >
                <option value="">-- Choose property --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.address}, {p.city} (${p.price.toLocaleString()})</option>
                ))}
              </select>
              <Home className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Offered Purchase Price ($)</label>
            <input
              type="number"
              value={offerPrice}
              onChange={e => setOfferPrice(e.target.value)}
              placeholder="e.g., 345000"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Document Draft</span>
          </button>
        </form>
      </div>

      {/* Contract history list */}
      <div id="docs-history-column" className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Recent Offer Drafts</h3>
          </div>
          <button 
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Folder</span>
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
          {loading && docs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <p className="text-xs">Fetching drafts from Google Drive...</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-700" />
              <p className="text-xs">No drafted purchase agreements found in your Google Drive.</p>
            </div>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/60 rounded-xl transition-all">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white text-xs font-semibold truncate pr-2">{doc.name}</h4>
                    {doc.modifiedTime && (
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {doc.webViewLink && (
                  <a 
                    href={doc.webViewLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
