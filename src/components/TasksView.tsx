import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, RefreshCw, Trash2, Calendar, ShieldAlert, CheckCircle2, ListTodo, Circle } from 'lucide-react';

interface TasksViewProps {
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

interface TaskList {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  notes?: string;
  status: 'completed' | 'needsAction';
  due?: string;
}

export default function TasksView({ user, accessToken, onLogin }: TasksViewProps) {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Create task inputs
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDue, setNewDue] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Task Lists
  const fetchTaskLists = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load Google Task lists.');
      const data = await res.json();
      const items = data.items || [];
      setLists(items);
      if (items.length > 0 && !selectedListId) {
        setSelectedListId(items[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error connecting to Google Tasks API.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks for Selected List
  const fetchTasks = async (listId: string) => {
    if (!accessToken || !listId) return;
    setLoadingTasks(true);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks from selected list.');
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Could not fetch tasks for this list.' });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchTaskLists();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedListId && accessToken) {
      fetchTasks(selectedListId);
    }
  }, [selectedListId, accessToken]);

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedListId) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(`Confirm Action:\nAre you sure you want to add this task to your Google Tasks list?`);
    if (!confirmed) return;

    setLoadingTasks(true);
    try {
      const body: any = {
        title: newTitle,
        notes: newNotes,
      };
      if (newDue) {
        body.due = new Date(newDue).toISOString();
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to add new task.');
      
      setNewTitle('');
      setNewNotes('');
      setNewDue('');
      setStatusMessage({ type: 'success', text: 'Task added successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
      fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to create task.' });
    } finally {
      setLoadingTasks(false);
    }
  };

  // Toggle status complete/incomplete
  const handleToggleStatus = async (task: Task) => {
    if (!selectedListId) return;
    const nextStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    // Toggle locally for instant UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          // If moving back to needsAction, Google API expects completed to be cleared/null on the backend
          completed: nextStatus === 'completed' ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update task status.');
      fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to update task state on server.' });
      // Revert local state
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!selectedListId) return;

    // MANDATORY rule: Include explicit user confirmation dialog before destructive/mutating operation
    const confirmed = window.confirm(`Confirm Action:\nAre you sure you want to delete this task from Google Tasks?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to delete task.');
      
      setStatusMessage({ type: 'success', text: 'Task deleted successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
      fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to delete task.' });
    }
  };

  if (!accessToken) {
    return (
      <div id="tasks-auth-container" className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-xl">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
          <CheckSquare className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Enable Google Tasks Manager</h3>
        <p className="text-slate-400 text-center text-sm mt-3 mb-6 leading-relaxed">
          Manage listings, walkthrough checklists, and transaction due dates directly on Google Tasks with real-time bi-directional synchronization.
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
    <div id="tasks-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Select List and Create Task */}
      <div id="tasks-creator-column" className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
          <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-2">
            <ListTodo className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Active Task List</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select List Container</label>
            <select
              value={selectedListId}
              onChange={e => setSelectedListId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm cursor-pointer"
            >
              {lists.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">
          <div className="flex items-center space-x-2.5 mb-4">
            <Plus className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Add New Task</h3>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Deliver contract to Title Co"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes / Details</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Escrow officer: Jordan, Phone: 555-0192"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loadingTasks || !selectedListId}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Google Tasks</span>
            </button>
          </form>
        </div>
      </div>

      {/* Tasks List */}
      <div id="tasks-list-column" className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Active Tasks</h3>
          </div>
          <button 
            onClick={() => selectedListId && fetchTasks(selectedListId)}
            disabled={loadingTasks}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw className={`h-3 w-3 ${loadingTasks ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {statusMessage && (
          <div className={`p-4 border-b ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-xs flex items-center space-x-2`}>
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="divide-y divide-slate-800/60 max-h-[580px] overflow-y-auto">
          {loadingTasks && tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm">Fetching tasks from Google Servers...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckSquare className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No tasks in this list. Keep up the great work!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-slate-800/20 transition-all flex items-start justify-between gap-4 group">
                <div className="flex items-start space-x-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-700 hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-sm font-semibold transition-all ${task.status === 'completed' ? 'text-slate-500 line-through decoration-slate-700' : 'text-white'}`}>
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl font-sans">
                        {task.notes}
                      </p>
                    )}

                    {task.due && (
                      <div className="flex items-center text-[10px] text-amber-500 font-mono mt-2 space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
