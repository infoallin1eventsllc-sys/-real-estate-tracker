import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_DEALS, 
  INITIAL_CLIENTS, 
  FINANCIAL_HISTORY 
} from './data';
import { Property, Deal, Client } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PipelineView from './components/PipelineView';
import PropertiesView from './components/PropertiesView';
import ClientsView from './components/ClientsView';
import InvestmentsView from './components/InvestmentsView';
import FinancialsView from './components/FinancialsView';
import AIWriterView from './components/AIWriterView';
import SheetsSyncView from './components/SheetsSyncView';
import GmailView from './components/GmailView';
import DocsView from './components/DocsView';
import CalendarView from './components/CalendarView';
import MeetView from './components/MeetView';
import TasksView from './components/TasksView';
import KeepView from './components/KeepView';
import ChatView from './components/ChatView';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { User } from 'firebase/auth';
import { Bell, Search, Calendar, ChevronRight, Cloud, CloudOff, RefreshCw, LogIn, LogOut, ExternalLink, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // States loaded from initial mock datasets
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [financialHistory, setFinancialHistory] = useState(FINANCIAL_HISTORY);

  // Auth and DB Sync States
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [showAuthHelpModal, setShowAuthHelpModal] = useState(false);

  // Load / Sync functions
  const loadDataFromDb = async (token: string) => {
    setDbSyncing(true);
    try {
      const res = await fetch('/api/db/fetch', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.properties?.length > 0 || data.deals?.length > 0 || data.clients?.length > 0) {
            setProperties(data.properties);
            setDeals(data.deals);
            setClients(data.clients);
            setFinancialHistory(data.financialHistory);
          } else {
            // Seed DB on first sync
            await fetch('/api/db/sync', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                properties,
                deals,
                clients,
                financialHistory
              })
            });
          }
          setDbConnected(true);
        }
      }
    } catch (error) {
      console.error("Failed to load/sync from Cloud SQL:", error);
    } finally {
      setDbSyncing(false);
    }
  };

  const saveDataToDb = async (token: string, props: Property[], dls: Deal[], cls: Client[], fh: any[]) => {
    setDbSyncing(true);
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: props,
          deals: dls,
          clients: cls,
          financialHistory: fh
        })
      });
    } catch (error) {
      console.error("Failed to save to Cloud SQL:", error);
    } finally {
      setDbSyncing(false);
    }
  };

  // Auth Mount Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        loadDataFromDb(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDbConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen for Google Sign-In failure events to trigger the interactive troubleshooting guide
  useEffect(() => {
    const handleSignInFailed = () => {
      setShowAuthHelpModal(true);
    };
    window.addEventListener('google-signin-failed', handleSignInFailed);
    return () => window.removeEventListener('google-signin-failed', handleSignInFailed);
  }, []);

  // Debounced Auto-sync State updates to database when active
  useEffect(() => {
    if (user && accessToken && dbConnected) {
      const delayDebounce = setTimeout(() => {
        saveDataToDb(accessToken, properties, deals, clients, financialHistory);
      }, 1000);
      return () => clearTimeout(delayDebounce);
    }
  }, [properties, deals, clients, financialHistory, user, accessToken, dbConnected]);

  const handleManualSync = async () => {
    if (accessToken) {
      await saveDataToDb(accessToken, properties, deals, clients, financialHistory);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await loadDataFromDb(result.accessToken);
      }
    } catch (err) {
      console.error("Manual login failed:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setDbConnected(false);
    // Revert back to local default states
    setProperties(INITIAL_PROPERTIES);
    setDeals(INITIAL_DEALS);
    setClients(INITIAL_CLIENTS);
    setFinancialHistory(FINANCIAL_HISTORY);
  };

  // Global actions for State changes
  const handleAddDeal = (newDeal: Omit<Deal, 'id'>) => {
    const dealWithId: Deal = {
      ...newDeal,
      id: `deal-${Date.now()}`
    };
    setDeals([dealWithId, ...deals]);
  };

  const handleDeleteDeal = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
  };

  const handleAddProperty = (newProperty: Omit<Property, 'id'>) => {
    const propWithId: Property = {
      ...newProperty,
      id: `prop-${Date.now()}`
    };
    setProperties([propWithId, ...properties]);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const handleAddClient = (newClient: Omit<Client, 'id'>) => {
    const clientWithId: Client = {
      ...newClient,
      id: `client-${Date.now()}`
    };
    setClients([clientWithId, ...clients]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleTogglePropertyStatus = (id: string, newStatus: Property['status']) => {
    setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  // Render view by matching view state
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            properties={properties} 
            deals={deals} 
            onNavigate={setCurrentView} 
          />
        );
      case 'pipeline':
        return (
          <PipelineView 
            deals={deals} 
            onAddDeal={handleAddDeal} 
            onDeleteDeal={handleDeleteDeal} 
          />
        );
      case 'properties':
        return (
          <PropertiesView 
            properties={properties} 
            onAddProperty={handleAddProperty} 
            onDeleteProperty={handleDeleteProperty} 
          />
        );
      case 'clients':
        return (
          <ClientsView 
            clients={clients} 
            deals={deals} 
            onAddClient={handleAddClient} 
            onDeleteClient={handleDeleteClient} 
            onUpdateClient={handleUpdateClient}
          />
        );
      case 'investments':
        return (
          <InvestmentsView 
            properties={properties} 
            onToggleStatus={handleTogglePropertyStatus}
          />
        );
      case 'financials':
        return (
          <FinancialsView 
            financialHistory={financialHistory} 
          />
        );
      case 'ai-writer':
        return (
          <AIWriterView />
        );
      case 'sheets-sync':
        return (
          <SheetsSyncView 
            properties={properties} 
            deals={deals} 
            clients={clients} 
            financialHistory={financialHistory} 
          />
        );
      case 'gmail':
        return (
          <GmailView 
            user={user} 
            accessToken={accessToken} 
            clients={clients} 
            onLogin={handleLogin} 
          />
        );
      case 'docs':
        return (
          <DocsView 
            user={user} 
            accessToken={accessToken} 
            clients={clients} 
            properties={properties} 
            onLogin={handleLogin} 
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            user={user} 
            accessToken={accessToken} 
            onLogin={handleLogin} 
          />
        );
      case 'meet':
        return (
          <MeetView 
            user={user} 
            accessToken={accessToken} 
            onLogin={handleLogin} 
          />
        );
      case 'tasks':
        return (
          <TasksView 
            user={user} 
            accessToken={accessToken} 
            onLogin={handleLogin} 
          />
        );
      case 'keep':
        return (
          <KeepView 
            user={user} 
            accessToken={accessToken} 
            onLogin={handleLogin} 
          />
        );
      case 'chat':
        return (
          <ChatView 
            user={user} 
            accessToken={accessToken} 
            onLogin={handleLogin} 
          />
        );
      default:
        return (
          <DashboardView 
            properties={properties} 
            deals={deals} 
            onNavigate={setCurrentView} 
          />
        );
    }
  };

  // Breadcrumb names
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'pipeline': return 'Deal Pipeline';
      case 'properties': return 'Property Grid';
      case 'clients': return 'Client Directory';
      case 'investments': return 'Investments Analysis';
      case 'financials': return 'Financial Performance';
      case 'ai-writer': return 'AI listing copywriter';
      case 'sheets-sync': return 'Google Sheets Sync';
      case 'gmail': return 'Gmail Communications';
      case 'docs': return 'Agreement Documents';
      case 'calendar': return 'Calendar Schedule';
      case 'meet': return 'Google Meet Rooms';
      case 'tasks': return 'Google Tasks Manager';
      case 'keep': return 'Google Keep Notes';
      case 'chat': return 'Google Chat Rooms';
      default: return 'Overview';
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div id="app-container" className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar navigation */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main panel */}
      <main id="main-content-panel" className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header toolbar */}
        <header id="header-bar" className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div className="flex items-center space-x-3.5 text-slate-600">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">{getViewTitle()}</h2>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{todayStr}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Database & Account Connection Status Card */}
            <div 
              id="connection-status-pill" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs relative group transition-all duration-700 ease-in-out ${
                dbSyncing 
                  ? 'bg-emerald-50/95 border-emerald-400 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' 
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={user?.email ? `Google User: ${user.email}` : 'No Google account connected'}
            >
              {dbConnected ? (
                <div className={`flex items-center space-x-1.5 font-semibold transition-colors duration-500 ${dbSyncing ? 'text-emerald-700' : 'text-emerald-600'}`}>
                  <Cloud className={`h-4 w-4 shrink-0 transition-transform duration-500 ${dbSyncing ? 'scale-110' : ''}`} />
                  <span>PostgreSQL Cloud SQL Connected</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualSync();
                    }}
                    disabled={dbSyncing}
                    title="Sync/Flush Data Now to Cloud SQL"
                    className={`ml-1.5 p-1 rounded-lg transition-all flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 ${
                      dbSyncing 
                        ? 'bg-emerald-200/60 text-emerald-800' 
                        : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${dbSyncing ? 'animate-spin text-emerald-700' : ''}`} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-slate-500 font-medium">
                  <CloudOff className="h-4 w-4 shrink-0" />
                  <span>Local Sandbox Storage</span>
                </div>
              )}

              <span className="text-slate-300">|</span>

              {user ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-600 hover:text-rose-600 transition-colors font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-500 font-semibold transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Connect Google</span>
                </button>
              )}

              {user?.email && (
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-slate-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-xl border border-slate-800 whitespace-nowrap z-50 pointer-events-none font-medium animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-semibold text-[10px]">Google Account:</span>
                    <span className="font-bold text-emerald-400 font-mono">{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notification button */}
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div id="content-viewport" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          {renderActiveView()}
        </div>

      </main>

      {/* Google Authentication Iframe Help Modal */}
      {showAuthHelpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">Google Sign-In Notice</h3>
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">Iframe Restriction Detected</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAuthHelpModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                We noticed that the Google Authentication window was closed or blocked.
              </p>
              <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-500 font-medium">
                Modern browsers (like Chrome, Safari, and Brave) block cross-origin popups and cookies inside <strong className="text-slate-700">embedded iframes</strong> for security. Since this preview runs in an iframe, Google Sign-In is restricted here.
              </p>
              
              <div className="space-y-3 pt-1">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">How to connect successfully:</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">1</span>
                    <p className="text-xs text-slate-600">
                      Click the <strong className="text-indigo-600">Open App in New Tab</strong> button below to open the application directly in your browser.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">2</span>
                    <p className="text-xs text-slate-600">
                      In the new tab, click <strong className="text-emerald-600">Connect Google</strong> in the top-right or inside the sync settings to authenticate successfully with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setShowAuthHelpModal(false);
                }}
                className="order-2 sm:order-1 flex-1 px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold rounded-xl border border-slate-200 transition-all text-center cursor-pointer"
              >
                Explore Locally
              </button>
              <button
                onClick={() => {
                  window.open(window.location.href, '_blank');
                  setShowAuthHelpModal(false);
                }}
                className="order-1 sm:order-2 flex-1 px-4 py-2.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Open App in New Tab</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
