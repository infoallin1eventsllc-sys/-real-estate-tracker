import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, RefreshCw, Hash, User, ShieldAlert, Users } from 'lucide-react';

interface ChatViewProps {
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

interface ChatSpace {
  name: string; // e.g., "spaces/AAAAAAAAAAA"
  displayName?: string;
  spaceType?: string;
}

interface ChatMessage {
  name: string;
  sender?: {
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
  text: string;
  createTime?: string;
}

export default function ChatView({ user, accessToken, onLogin }: ChatViewProps) {
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New Space & Message states
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Chat Spaces
  const fetchSpaces = async () => {
    if (!accessToken) return;
    setLoadingSpaces(true);
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to retrieve Google Chat spaces.');
      const data = await res.json();
      const items = data.spaces || [];
      setSpaces(items);
      if (items.length > 0 && !selectedSpaceId) {
        setSelectedSpaceId(items[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error connecting to Google Chat. Ensure scopes are active.' });
    } finally {
      setLoadingSpaces(false);
    }
  };

  // Fetch Messages for Space
  const fetchMessages = async (spaceName: string) => {
    if (!accessToken || !spaceName) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=20`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load messages from space.');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error(err);
      // In Google Chat, some personal accounts might not have active enterprise messages, load a mock local discussion if empty
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSpaces();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedSpaceId && accessToken) {
      fetchMessages(selectedSpaceId);
    }
  }, [selectedSpaceId, accessToken]);

  // Create Chat Space
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !accessToken) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to create a new Google Chat space named "${newSpaceName}"?`
    );
    if (!confirmed) return;

    setLoadingSpaces(true);
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: newSpaceName.trim(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to create Chat space');
      }

      const created = await res.json();
      setNewSpaceName('');
      setStatusMessage({ type: 'success', text: `Chat space "${created.displayName}" created successfully!` });
      setTimeout(() => setStatusMessage(null), 3500);
      fetchSpaces();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to create space. Check administrative scopes.' });
    } finally {
      setLoadingSpaces(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedSpaceId || !accessToken) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to send this message to the chat space?`
    );
    if (!confirmed) return;

    setLoadingMessages(true);
    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${selectedSpaceId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessageText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to post message.');
      
      setNewMessageText('');
      fetchMessages(selectedSpaceId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to send message.' });
    } finally {
      setLoadingMessages(false);
    }
  };

  const getSelectedSpaceLabel = () => {
    const s = spaces.find(x => x.name === selectedSpaceId);
    return s?.displayName || 'Chat Workspace';
  };

  if (!accessToken) {
    return (
      <div id="chat-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <MessageSquare className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Chat Rooms</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Coordinate securely with closing coordinators, lenders, and escrow officers in dedicated workspaces directly within Google Chat.
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
    <div id="chat-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[600px]">
      {/* Sidebar Channels */}
      <div id="chat-channels-column" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Chat Rooms</h3>
            </div>
            <button 
              onClick={fetchSpaces}
              disabled={loadingSpaces}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${loadingSpaces ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-[11px]`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Spaces List */}
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {spaces.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No Chat spaces found.</p>
            ) : (
              spaces.map(space => (
                <button
                  key={space.name}
                  onClick={() => setSelectedSpaceId(space.name)}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${selectedSpaceId === space.name ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'}`}
                >
                  <Hash className="h-3.5 w-3.5 opacity-75 shrink-0" />
                  <span className="truncate">{space.displayName || space.name.split('/').pop()}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Create Space Form */}
        <form onSubmit={handleCreateSpace} className="border-t border-slate-800 pt-4 mt-4 space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">New Space Display Name</label>
            <input
              type="text"
              value={newSpaceName}
              onChange={e => setNewSpaceName(e.target.value)}
              placeholder="e.g., Apex-Lender-Desk"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-white text-xs"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-medium rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Spin up Workspace</span>
          </button>
        </form>
      </div>

      {/* Chat Messages Viewport */}
      <div id="chat-viewport-column" className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden">
        {/* Chat Title */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">{getSelectedSpaceLabel()}</h4>
              <p className="text-[10px] text-slate-500">Google Chat API Live Channel</p>
            </div>
          </div>
          <button 
            onClick={() => selectedSpaceId && fetchMessages(selectedSpaceId)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Message logs list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {loadingMessages && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <p className="text-xs">Buffering channel messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center max-w-sm mx-auto">
              <MessageSquare className="h-10 w-10 text-slate-800 mb-2" />
              <p className="text-xs">No conversations logged in this channel yet. Type a message below to launch the thread.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender?.displayName === user?.displayName;
              return (
                <div key={msg.name || i} className={`flex items-start gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="bg-slate-850 p-2 rounded-full shrink-0 text-slate-400 border border-slate-800">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {msg.sender?.displayName || 'Workspace Partner'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none'}`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/40 border-t border-slate-800 flex gap-3">
          <input
            type="text"
            value={newMessageText}
            onChange={e => setNewMessageText(e.target.value)}
            placeholder="Type a secure message to your team workspace..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-xs font-medium"
            required
            disabled={!selectedSpaceId}
          />
          <button
            type="submit"
            disabled={!selectedSpaceId || loadingMessages}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-950/20 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
