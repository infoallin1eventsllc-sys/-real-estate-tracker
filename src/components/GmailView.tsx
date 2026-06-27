import React, { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, User, Sparkles, Inbox, ShieldAlert } from 'lucide-react';
import { Client } from '../types';

interface GmailViewProps {
  user: any;
  accessToken: string | null;
  clients: Client[];
  onLogin: () => void;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export default function GmailView({ user, accessToken, clients, onLogin }: GmailViewProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load emails
  const fetchEmails = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to load messages from Gmail');
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const detailedMsgs = await Promise.all(
          data.messages.map(async (msg: { id: string }) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const detail = await detailRes.json();
            
            const headers = detail.payload?.headers || [];
            const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
            const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
            const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');

            return {
              id: msg.id,
              subject: subjectHeader ? subjectHeader.value : '(No Subject)',
              from: fromHeader ? fromHeader.value : 'Unknown Sender',
              date: dateHeader ? new Date(dateHeader.value).toLocaleDateString() : 'Unknown Date',
              snippet: detail.snippet || '',
            };
          })
        );
        setMessages(detailedMsgs);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Could not connect to Gmail API. Ensure you signed in with full scopes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEmails();
    }
  }, [accessToken]);

  // Construct MIME email in base64url
  const makeEmailMime = (to: string, subject: string, body: string) => {
    const str = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body.replace(/\n/g, '<br />')
    ].join('\n');
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Send Email with User Confirmation
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composing.to || !composing.subject || !composing.body) {
      setStatusMessage({ type: 'error', text: 'All email fields are required.' });
      return;
    }

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to send this email to "${composing.to}" on behalf of Jordan Vance?`
    );
    if (!confirmed) return;

    try {
      const rawMime = makeEmailMime(composing.to, composing.subject, composing.body);
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: rawMime }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to send email');
      }

      setStatusMessage({ type: 'success', text: 'Email sent successfully!' });
      setComposing({ to: '', subject: '', body: '' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error sending email. Please check your network and account permissions.' });
    }
  };

  const handleSelectClient = (clientEmail: string) => {
    setComposing(prev => ({ ...prev, to: clientEmail }));
  };

  if (!accessToken) {
    return (
      <div id="gmail-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <Mail className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Gmail Client Suite</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Unlock standard real estate communications. View incoming transaction inquiries and email listings directly to buyers or sellers securely.
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
    <div id="gmail-inbox-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Inbox details */}
      <div id="gmail-inbox-column" className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <Inbox className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Transaction Inbox</h3>
          </div>
          <button 
            onClick={fetchEmails}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Mail</span>
          </button>
        </div>

        {statusMessage && (
          <div className={`p-4 border-b ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-sm flex items-center space-x-2`}>
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="divide-y divide-slate-800/60 max-h-[580px] overflow-y-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm">Fetching messages from Gmail servers...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Mail className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No transaction-related emails found in your Inbox.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start gap-4">
                  <span className="font-medium text-emerald-400 text-sm truncate max-w-[180px]">
                    {msg.from.split(' <')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                    {msg.date}
                  </span>
                </div>
                <h4 className="text-white text-xs font-semibold mt-1 truncate">
                  {msg.subject}
                </h4>
                <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed line-clamp-2">
                  {msg.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compose */}
      <div id="gmail-compose-column" className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <Send className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white">Direct Client Mail</h3>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Email</label>
              <input 
                type="email"
                value={composing.to}
                onChange={e => setComposing({ ...composing, to: e.target.value })}
                placeholder="client@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
              />
            </div>

            {/* Quick-select Clients */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Select from Client Records</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                {clients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c.email)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-850 hover:bg-emerald-600/20 hover:text-emerald-400 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-colors"
                  >
                    <User className="h-2.5 w-2.5" />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
              <input 
                type="text"
                value={composing.subject}
                onChange={e => setComposing({ ...composing, subject: e.target.value })}
                placeholder="e.g., Update on purchase offer terms"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Message Body (HTML Supported)</label>
              <textarea 
                rows={6}
                value={composing.body}
                onChange={e => setComposing({ ...composing, body: e.target.value })}
                placeholder="Dear client, I am delighted to share that your property offer has been generated..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Secure Email</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
