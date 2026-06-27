import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Clock, MapPin, ShieldAlert, AlignLeft, CalendarRange } from 'lucide-react';

interface CalendarViewProps {
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

export default function CalendarView({ user, accessToken, onLogin }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState({
    title: '',
    location: '',
    description: '',
    date: '',
    time: '',
    duration: '60', // in minutes
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load upcoming calendar events
  const fetchEvents = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMin}&maxResults=8`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch events from Google Calendar.');
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Could not connect to Google Calendar. Ensure the correct scopes are active.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEvents();
    }
  }, [accessToken]);

  // Handle Event Booking with User Confirmation
  const handleBookEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.title || !booking.date || !booking.time) {
      setStatusMessage({ type: 'error', text: 'Title, Date, and Time are required.' });
      return;
    }

    const startDateTime = new Date(`${booking.date}T${booking.time}`).toISOString();
    const endDateTime = new Date(new Date(startDateTime).getTime() + Number(booking.duration) * 60 * 1000).toISOString();

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(
      `Confirm Action:\nAre you sure you want to schedule this event on your real Google Calendar?\n\n` +
      `Title: ${booking.title}\n` +
      `Time: ${new Date(startDateTime).toLocaleString()}\n` +
      `Location: ${booking.location || 'N/A'}`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: booking.title,
          location: booking.location,
          description: booking.description,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to book calendar event');
      }

      setStatusMessage({ type: 'success', text: 'Calendar event booked successfully!' });
      setBooking({
        title: '',
        location: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
      });
      setTimeout(() => setStatusMessage(null), 4000);
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error occurred while scheduling event.' });
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div id="calendar-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <Calendar className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Calendar Booking</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Manage your schedule directly from ApexEstate. Seamlessly coordinate showing slots, inspections, and closing signings on your master calendar.
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
    <div id="calendar-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Book Event Form */}
      <div id="calendar-book-column" className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
        <div className="flex items-center space-x-2.5 mb-5 border-b border-slate-800 pb-3">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">Schedule Showing / Consultation</h3>
        </div>

        {statusMessage && (
          <div className={`p-4 mb-4 rounded-xl border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-xs flex items-center space-x-2`}>
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleBookEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Event Title</label>
            <input
              type="text"
              value={booking.title}
              onChange={e => setBooking({ ...booking, title: e.target.value })}
              placeholder="e.g., Showing at 742 Evergreen Terrace"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Location / Address</label>
            <div className="relative">
              <input
                type="text"
                value={booking.location}
                onChange={e => setBooking({ ...booking, location: e.target.value })}
                placeholder="742 Evergreen Terrace, Springfield"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm"
              />
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                value={booking.date}
                onChange={e => setBooking({ ...booking, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Time</label>
              <input
                type="time"
                value={booking.time}
                onChange={e => setBooking({ ...booking, time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (Minutes)</label>
            <div className="relative">
              <select
                value={booking.duration}
                onChange={e => setBooking({ ...booking, duration: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm appearance-none cursor-pointer"
              >
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="90">1.5 Hours</option>
                <option value="120">2 Hours</option>
              </select>
              <Clock className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Event Description</label>
            <div className="relative">
              <textarea
                rows={3}
                value={booking.description}
                onChange={e => setBooking({ ...booking, description: e.target.value })}
                placeholder="Walkthrough with client Alice Smith..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-sans"
              />
              <AlignLeft className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Event</span>
          </button>
        </form>
      </div>

      {/* Events List */}
      <div id="calendar-list-column" className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <CalendarRange className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Upcoming Showings & Milestones</h3>
          </div>
          <button 
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Calendar</span>
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[580px] overflow-y-auto">
          {loading && events.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm">Retrieving your events from Google Calendar...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No scheduled showings or contract closings found.</p>
            </div>
          ) : (
            events.map(event => {
              const startDateTime = event.start?.dateTime || event.start?.date || '';
              const dateObj = startDateTime ? new Date(startDateTime) : null;
              
              return (
                <div key={event.id} className="p-4 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/60 rounded-xl transition-all flex items-start gap-4">
                  <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl flex flex-col items-center shrink-0 min-w-[56px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      {dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A'}
                    </span>
                    <span className="text-lg font-bold mt-0.5">
                      {dateObj ? dateObj.getDate() : '-'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-semibold truncate">{event.summary}</h4>
                    
                    {dateObj && (
                      <div className="flex items-center text-slate-400 text-xs mt-1.5 space-x-1.5">
                        <Clock className="h-3 w-3 text-emerald-400" />
                        <span>
                          {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center text-slate-400 text-xs mt-1 space-x-1.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-slate-400 text-[11px] mt-2 border-t border-slate-800/80 pt-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
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
