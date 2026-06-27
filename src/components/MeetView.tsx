import React, { useState, useEffect } from 'react';
import { Video, Plus, Copy, ExternalLink, Calendar, Users, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MeetViewProps {
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

interface MeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
  createdTime: string;
  title: string;
}

export default function MeetView({ user, accessToken, onLogin }: MeetViewProps) {
  const [spaces, setSpaces] = useState<MeetSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load previously generated spaces from localStorage to keep state persistent
  useEffect(() => {
    const saved = localStorage.getItem('apex_meet_spaces');
    if (saved) {
      try {
        setSpaces(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSpaces = (newSpaces: MeetSpace[]) => {
    setSpaces(newSpaces);
    localStorage.setItem('apex_meet_spaces', JSON.stringify(newSpaces));
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const meetingTitle = title.trim() || 'Real Estate Consultation';

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to generate a new Google Meet space for "${meetingTitle}"?`
    );
    if (!confirmed) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // Create a Google Meet Space
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create Meet space');
      }

      const data = await response.json();

      // Extract details
      const spaceName = data.name; // e.g. "spaces/abc-defg-hij"
      const meetingUri = data.meetingUri || `https://meet.google.com/${spaceName.replace('spaces/', '')}`;
      const meetingCode = spaceName.replace('spaces/', '');

      const newSpace: MeetSpace = {
        name: spaceName,
        meetingUri,
        meetingCode,
        createdTime: new Date().toLocaleString(),
        title: meetingTitle,
      };

      const updated = [newSpace, ...spaces];
      saveSpaces(updated);
      setTitle('');
      setStatusMessage({ type: 'success', text: `Google Meet space "${meetingTitle}" generated successfully!` });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: 'Error generating Google Meet. Ensure Meet API is enabled in your cloud project and scopes are accepted.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSpace = (code: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this meeting link from your log?');
    if (confirmed) {
      const filtered = spaces.filter(s => s.meetingCode !== code);
      saveSpaces(filtered);
    }
  };

  if (!accessToken) {
    return (
      <div id="meet-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <Video className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Meet Spaces</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Instantly generate dedicated Google Meet links for showings, negotiations, and buyer presentations with single-click integration.
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
    <div id="meet-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Generate Space Form */}
      <div id="meet-generator-column" className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
        <div className="flex items-center space-x-2.5 mb-5 border-b border-slate-800 pb-3">
          <Video className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">Instant Conference Generator</h3>
        </div>

        {statusMessage && (
          <div className={`p-4 mb-4 rounded-xl border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-xs flex items-center space-x-2`}>
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateSpace} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Meeting / Consultation Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Buyer Review: Alice Smith"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Generating a space will pre-configure and register a production Google Meet room instantly on Google servers. The generated links do not expire and can be shared with all participants.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Create Google Meet Space</span>
          </button>
        </form>
      </div>

      {/* Meet Space Logs */}
      <div id="meet-logs-column" className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Active Meeting Spaces</h3>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono font-bold">
            {spaces.length} Rooms
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
          {spaces.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Video className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No meeting spaces created yet. Use the panel on the left to spin one up.</p>
            </div>
          ) : (
            spaces.map(space => (
              <div key={space.meetingCode} className="p-4 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/60 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-white text-sm font-semibold truncate">{space.title}</h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-[11px] text-slate-400 mt-2 gap-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-emerald-400" />
                      <span>{space.createdTime}</span>
                    </span>
                    <span className="font-mono bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      Code: {space.meetingCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(space.meetingUri, space.meetingCode)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
                    title="Copy Meeting Link"
                  >
                    {copiedId === space.meetingCode ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={space.meetingUri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors text-xs font-semibold border border-emerald-500/20"
                  >
                    <span>Join</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteSpace(space.meetingCode)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove from history"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
