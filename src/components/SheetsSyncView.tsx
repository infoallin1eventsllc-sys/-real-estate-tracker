import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  Link2, 
  HelpCircle, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Property, Deal, Client, FinancialEntry } from '../types';
import { googleSignIn, logout, initAuth } from '../lib/firebase';
import { User } from 'firebase/auth';

interface SheetsSyncViewProps {
  properties: Property[];
  deals: Deal[];
  clients: Client[];
  financialHistory: FinancialEntry[];
}

interface SyncLog {
  time: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export default function SheetsSyncView({ properties, deals, clients, financialHistory }: SheetsSyncViewProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncMode, setSyncMode] = useState<'create' | 'existing'>('create');
  const [existingSpreadsheetUrl, setExistingSpreadsheetUrl] = useState<string>('');
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncedSheetUrl, setSyncedSheetUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Extract ID from a Google Sheet URL
  const getSpreadsheetId = (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return '';
    // Check if it's a direct URL
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken('');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        addLog('info', `Successfully signed in as ${res.user.email}`);
      }
    } catch (error: any) {
      console.error(error);
      addLog('error', `Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken('');
      setSyncedSheetUrl('');
      setSyncLogs([]);
      addLog('info', 'Signed out from Google account');
    } catch (error: any) {
      console.error(error);
    }
  };

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSyncLogs(prev => [{ time: timeStr, type, message }, ...prev]);
  };

  const handleSync = async () => {
    if (!accessToken) {
      setErrorMsg('You must sign in with your Google account first.');
      return;
    }

    // Confirm update with the user
    const confirmed = window.confirm(
      syncMode === 'existing'
        ? "Are you sure you want to write the app data into the linked Google Sheet? Any existing content on tabs 'Properties', 'Deals & Pipeline', 'Clients', and 'Financials' will be cleared and replaced."
        : "Are you sure you want to create a new Google Sheet in your Google Drive and populate it with your real estate datasets?"
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setErrorMsg('');
    setSyncedSheetUrl('');
    setSyncLogs([]);

    const sheetIdInput = syncMode === 'existing' ? getSpreadsheetId(existingSpreadsheetUrl) : '';
    if (syncMode === 'existing' && !sheetIdInput) {
      setErrorMsg('Please enter a valid Google Sheet URL or Spreadsheet ID.');
      setIsSyncing(false);
      return;
    }

    addLog('info', 'Initiating live data payload collation...');
    addLog('info', `Found ${properties.length} Properties, ${deals.length} Deals, ${clients.length} Clients, and ${financialHistory.length} ledger months.`);

    try {
      if (syncMode === 'existing') {
        addLog('info', `Validating connection to spreadsheet ID: ${sheetIdInput}...`);
      } else {
        addLog('info', 'Requesting Google Sheets API to provision a new workspace spreadsheet...');
      }

      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          spreadsheetId: sheetIdInput,
          properties,
          deals,
          clients,
          financialHistory,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncedSheetUrl(result.spreadsheetUrl);
        addLog('success', 'Workspace spreadsheet connection established.');
        addLog('success', 'Cleared cell ranges to prevent legacy/ghost rows.');
        addLog('success', `Synced ${properties.length} Properties rows to 'Properties' tab.`);
        addLog('success', `Synced ${deals.length} active pipelines to 'Deals & Pipeline' tab.`);
        addLog('success', `Synced ${clients.length} profiles to 'Clients' tab.`);
        addLog('success', `Synced financial ledger to 'Financials' tab.`);
        addLog('success', 'Synchronization completed. Google Sheets spreadsheet is ready!');
      } else {
        const errorText = result.error || 'Server rejected spreadsheet synchronization.';
        setErrorMsg(errorText);
        addLog('error', errorText);
      }
    } catch (err: any) {
      console.error(err);
      const errText = 'A connection error occurred. Please verify your internet and try again.';
      setErrorMsg(errText);
      addLog('error', errText);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="sheets-sync-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-500 shrink-0" />
            <span>Google Sheets Live Sync</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Export, sync, and back up your entire broker-investor workspace directly to real Google Sheets spreadsheets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Connection Status & Mode Configuration (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Auth Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Google Account Connection</span>
              </h3>
              {user && (
                <button 
                  onClick={handleSignOut}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect Account</span>
                </button>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-6 space-x-3 text-slate-500">
                  <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                  <span className="text-sm font-medium">Checking authorization status...</span>
                </div>
              ) : user ? (
                <div className="flex items-start space-x-4">
                  <img 
                    src={user.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s120-c'} 
                    alt={user.displayName || 'Google User'} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{user.displayName || 'Authorized Member'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-semibold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Ready for Google Sheets API requests</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Google Sheets Integration Not Connected</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Authorize Google Workspace permissions with permission from the app's users to connect, sync, and structure live spreadsheets.
                    </p>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Connect Google Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sync Configuration Panel (Only shown when authenticated) */}
          {user && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
                Sync Settings
              </h3>

              {/* Mode Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSyncMode('create')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                    syncMode === 'create'
                      ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${syncMode === 'create' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Create a New Google Sheet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Provison a fresh Spreadsheet in your Google Drive with formatted tabs automatically.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSyncMode('existing')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                    syncMode === 'existing'
                      ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${syncMode === 'existing' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Link an Existing Sheet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Provide a link to an existing Google Sheet. It will initialize/populate missing tabs.</p>
                  </div>
                </button>
              </div>

              {/* Existing Sheet URL input */}
              {syncMode === 'existing' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Spreadsheet URL or Spreadsheet ID</label>
                  <input
                    type="text"
                    required
                    value={existingSpreadsheetUrl}
                    onChange={(e) => setExistingSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block flex items-start space-x-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>The sheets titled 'Properties', 'Deals & Pipeline', 'Clients', and 'Financials' will be added if missing, cleared, and overwritten.</span>
                  </span>
                </div>
              )}

              {/* Data Summary Checklist */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-3.5 border border-slate-100 text-xs text-slate-600">
                <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>Worksheets/Tabs Prepared for Upload</span>
                </p>
                <div className="grid grid-cols-2 gap-3 pl-1 font-medium">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>Properties ({properties.length} rows)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>Deals & Pipeline ({deals.length} rows)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>Clients ({clients.length} rows)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>Financials ({financialHistory.length} rows)</span>
                  </div>
                </div>
              </div>

              {/* Trigger Button */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start space-x-2">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Writing Live Spreadsheet Records...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Sync App Data with Google Sheets</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sync Status Logs / Result Column (Right Column) */}
        <div className="space-y-6">
          {/* Synchronized Document Panel */}
          {syncedSheetUrl && (
            <div id="sync-success-panel" className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl p-6 shadow-xl space-y-4 animate-scale-up">
              <div className="flex items-center space-x-2.5 border-b border-emerald-800 pb-3">
                <div className="p-1.5 bg-emerald-500 rounded text-white shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sync Completed!</h4>
                  <p className="text-[10px] text-emerald-200">Google Sheets live update ready</p>
                </div>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed">
                Your broker datasets have successfully been exported and live-synced to your Google Sheets.
              </p>

              <a
                href={syncedSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Sync History Logs Terminal */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 min-h-[320px] flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Live Activity Logger</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">UTILITY_LOGS</span>
            </div>

            <div className="flex-1 py-4 overflow-y-auto max-h-[220px] space-y-2.5 scrollbar-thin text-[11px] font-mono">
              {syncLogs.length > 0 ? (
                syncLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={
                      log.type === 'success' 
                        ? 'text-emerald-400' 
                        : log.type === 'error' 
                          ? 'text-rose-400' 
                          : 'text-slate-300'
                    }>
                      {log.type === 'success' ? '✔ ' : log.type === 'error' ? '✖ ' : 'ℹ '}
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-2 py-12 text-slate-500 text-center">
                  <RefreshCw className="h-8 w-8 text-slate-800" />
                  <p className="font-semibold">No active processes</p>
                  <p className="text-[10px]">Your connection is secure. Connect and launch a Sync to initiate upload tasks.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>Secure OAuth Session</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
