import {
  LayoutDashboard,
  GitMerge,
  Home,
  Users,
  Building2,
  DollarSign,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { View } from '../types';

const NAV: { id: View; label: string; Icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', Icon: GitMerge },
  { id: 'properties', label: 'Properties', Icon: Home },
  { id: 'clients', label: 'Clients', Icon: Users },
  { id: 'investments', label: 'Investments', Icon: Building2 },
  { id: 'financials', label: 'Financials', Icon: DollarSign },
  { id: 'ai', label: 'AI Writer', Icon: Sparkles },
];

interface Props {
  current: View;
  onChange: (v: View) => void;
}

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Portfolio</p>
        <p className="text-lg font-bold mt-0.5">RE Tracker</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              current === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        © {new Date().getFullYear()} Otis Williams
      </div>
    </aside>
  );
}
