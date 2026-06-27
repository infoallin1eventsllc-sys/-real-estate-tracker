import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, RefreshCw, Trash2, Search, Palette, ShieldAlert, Check } from 'lucide-react';

interface KeepViewProps {
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

interface KeepNote {
  id: string;
  title: string;
  body: string;
  color: 'slate' | 'emerald' | 'indigo' | 'amber' | 'rose';
  createdTime: string;
}

const NOTE_COLORS = [
  { id: 'slate', bg: 'bg-slate-950/60 border-slate-800 text-slate-100', dot: 'bg-slate-500' },
  { id: 'emerald', bg: 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100', dot: 'bg-emerald-500' },
  { id: 'indigo', bg: 'bg-indigo-950/20 border-indigo-500/20 text-indigo-100', dot: 'bg-indigo-500' },
  { id: 'amber', bg: 'bg-amber-950/20 border-amber-500/20 text-amber-100', dot: 'bg-amber-500' },
  { id: 'rose', bg: 'bg-rose-950/20 border-rose-500/20 text-rose-100', dot: 'bg-rose-500' },
];

export default function KeepView({ user, accessToken, onLogin }: KeepViewProps) {
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState<KeepNote['color']>('slate');
  const [loading, setLoading] = useState(false);
  const [apiRestricted, setApiRestricted] = useState(false);

  // New Note State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Load Saved Local Notes if API restricted or on startup
  useEffect(() => {
    const saved = localStorage.getItem('apex_keep_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed initial brainstorm items
      const initial: KeepNote[] = [
        {
          id: 'note-1',
          title: 'Premium Listing Pitch',
          body: 'Emphasize high-efficiency geothermal heating and floor-to-ceiling double-paned Marvin windows.',
          color: 'emerald',
          createdTime: new Date().toLocaleDateString(),
        },
        {
          id: 'note-2',
          title: 'Client Negotiation Strategy',
          body: 'Buyer is firm on escrow closing within 30 days. Ask seller for home warranty credit in lieu of repair allowance.',
          color: 'indigo',
          createdTime: new Date().toLocaleDateString(),
        }
      ];
      setNotes(initial);
      localStorage.setItem('apex_keep_notes', JSON.stringify(initial));
    }
  }, []);

  const saveNotes = (updated: KeepNote[]) => {
    setNotes(updated);
    localStorage.setItem('apex_keep_notes', JSON.stringify(updated));
  };

  // Google Keep API Attempt
  const fetchGoogleKeepNotes = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('https://keep.googleapis.com/v1/notes', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.status === 403 || res.status === 404) {
        setApiRestricted(true);
        setStatusMessage({
          type: 'warning',
          text: 'Google Keep API is restricted to Workspace Enterprise Domains. Activated high-fidelity Workspace Sticky Board instead.'
        });
      } else {
        const data = await res.json();
        // Handle Keep note structures if successfully retrieved
        if (data.notes) {
          const formatted: KeepNote[] = data.notes.map((n: any) => ({
            id: n.name || `note-${Date.now()}-${Math.random()}`,
            title: n.title || 'Untitled Note',
            body: n.body?.text?.text || '',
            color: 'slate',
            createdTime: new Date().toLocaleDateString()
          }));
          saveNotes(formatted);
        }
      }
    } catch (err) {
      console.error('Google Keep API call error:', err);
      setApiRestricted(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchGoogleKeepNotes();
    }
  }, [accessToken]);

  // Create Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(`Confirm Action:\nAre you sure you want to add this note to your board?`);
    if (!confirmed) return;

    setLoading(true);

    try {
      const newNote: KeepNote = {
        id: `note-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        color: selectedColor,
        createdTime: new Date().toLocaleDateString()
      };

      if (accessToken && !apiRestricted) {
        // Attempt to call Real Keep API if not restricted
        const res = await fetch('https://keep.googleapis.com/v1/notes', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            body: { text: { text: body.trim() } }
          }),
        });

        if (res.status === 403 || res.status === 404) {
          setApiRestricted(true);
          // Sync to local
          const updated = [newNote, ...notes];
          saveNotes(updated);
        } else if (res.ok) {
          fetchGoogleKeepNotes();
        }
      } else {
        // Sync to high-fidelity Local Workspace Board
        const updated = [newNote, ...notes];
        saveNotes(updated);
      }

      setTitle('');
      setBody('');
      setSelectedColor('slate');
      if (!apiRestricted) {
        setStatusMessage({ type: 'success', text: 'Note posted successfully!' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(`Confirm Action:\nAre you sure you want to permanently delete this note?`);
    if (!confirmed) return;

    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  // Filter & Search Notes
  const filteredNotes = notes.filter(note => {
    const term = search.toLowerCase();
    return note.title.toLowerCase().includes(term) || note.body.toLowerCase().includes(term);
  });

  if (!accessToken) {
    return (
      <div id="keep-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <StickyNote className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Keep Workspace</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Brainstorm listing taglines, capture walkthrough defects, and save agent reminders directly on a secure, visually structured sticky board.
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
    <div id="keep-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Create Sticky Note */}
      <div id="keep-creator-column" className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
          <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-2">
            <StickyNote className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Workspace Sticky Board</h3>
          </div>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Tagline Idea: 742 Evergreen"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Brainstorm Content</label>
              <textarea
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Captivating sunset views, private redwood deck, and newly refinished solid white-oak flooring..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm font-sans"
                required
              />
            </div>

            {/* Note Colors selection */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Sticky Card Color</label>
              <div className="flex items-center space-x-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.id as KeepNote['color'])}
                    className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${color.dot} ${selectedColor === color.id ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {selectedColor === color.id && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Pin Sticky Note</span>
            </button>
          </form>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      <div id="keep-grid-column" className="lg:col-span-8 space-y-6">
        {/* Search & Notice Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brainstorm notes..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2 text-white text-xs"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs text-slate-400 font-mono font-bold">
              {filteredNotes.length} Pin{filteredNotes.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={fetchGoogleKeepNotes}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Cloud</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-2xl border ${statusMessage.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-xs flex items-center space-x-3`}>
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Note Grid */}
        <div id="keep-sticky-cards" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <StickyNote className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No brainstorm tags or board pins matched your search.</p>
            </div>
          ) : (
            filteredNotes.map(note => {
              const matchedStyle = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
              return (
                <div key={note.id} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-lg hover:scale-[1.01] ${matchedStyle.bg}`}>
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-white text-sm">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors shrink-0"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-300 text-xs mt-3 leading-relaxed whitespace-pre-line font-sans">
                      {note.body}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/60 mt-4 pt-3 text-[10px] text-slate-500">
                    <span className="font-mono">{note.createdTime}</span>
                    <span className="font-semibold uppercase tracking-wider text-[8px] border border-slate-800 px-1.5 py-0.5 rounded">
                      {note.color}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
