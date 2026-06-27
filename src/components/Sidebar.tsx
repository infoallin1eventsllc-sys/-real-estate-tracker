import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Home, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  Building,
  ArrowUpRight,
  Menu,
  X,
  FileSpreadsheet,
  Mail,
  FileText,
  Calendar,
  Video,
  CheckSquare,
  StickyNote,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & KPIs' },
    { id: 'pipeline', name: 'Deal Pipeline', icon: GitBranch, desc: '6-Stage Tracker' },
    { id: 'properties', name: 'Properties', icon: Home, desc: 'Property Grid' },
    { id: 'clients', name: 'Clients', icon: Users, desc: 'Client Records & Deals' },
    { id: 'investments', name: 'Investments', icon: Building, desc: 'Portfolio & Cap Rates' },
    { id: 'financials', name: 'Financials', icon: BarChart3, desc: 'Income & Performance' },
    { id: 'ai-writer', name: 'AI Listing Writer', icon: Sparkles, desc: 'Smart Description Gen' },
    { id: 'sheets-sync', name: 'Google Sheets Sync', icon: FileSpreadsheet, desc: 'Live Sheets Integration' },
    { id: 'gmail', name: 'Gmail Communications', icon: Mail, desc: 'Direct Inbox & Compose' },
    { id: 'docs', name: 'Agreement Documents', icon: FileText, desc: 'Automated Offer Drafting' },
    { id: 'calendar', name: 'Calendar Schedule', icon: Calendar, desc: 'Showings & Closings' },
    { id: 'meet', name: 'Google Meet', icon: Video, desc: 'Create Meeting Rooms' },
    { id: 'tasks', name: 'Google Tasks', icon: CheckSquare, desc: 'Manage Agent Tasks' },
    { id: 'keep', name: 'Google Keep', icon: StickyNote, desc: 'Brainstorm Board' },
    { id: 'chat', name: 'Google Chat', icon: MessageSquare, desc: 'Team Workspace Chat' },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div id="mobile-topbar" className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 md:hidden border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
            <Building className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">ApexEstate</span>
        </div>
        <button 
          id="toggle-mobile-sidebar"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white focus:outline-none"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar background overlay for mobile */}
      {mobileOpen && (
        <div 
          id="mobile-overlay"
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        id="sidebar"
        className={`fixed md:sticky top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 md:transform-none h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header brand */}
        <div id="sidebar-header" className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-900/20">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight text-lg">ApexEstate</h1>
              <p className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase">Agent & Investor</p>
            </div>
          </div>
          <button 
            id="close-mobile-sidebar"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav id="sidebar-nav" className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-start space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-medium' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User profile info at bottom */}
        <div id="sidebar-footer" className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-400">
                JD
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Jordan Vance</p>
              <p className="text-xs text-slate-400 truncate">Broker & Syndicator</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
