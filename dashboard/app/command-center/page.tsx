'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'recurring' | 'backlog' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agentId?: string;
  projectId?: string;
  progress: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    name: string;
  };
}

interface Activity {
  id: string;
  type: string;
  agentId?: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface Stats {
  tasksThisWeek: number;
  inProgress: number;
  total: number;
  completion: number;
  activeAgents: number;
  activeProjects: number;
}

export default function CommandCenterTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'backlog' as 'backlog' | 'progress' | 'recurring',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    agentId: 'main',
  });

  useEffect(() => {
    fetchData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, activityRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/tasks`),
        fetch(`${API_URL}/api/activity?limit=20`),
        fetch(`${API_URL}/api/stats/company`),
      ]);

      const tasksData = await tasksRes.json();
      const activityData = await activityRes.json();
      const statsData = await statsRes.json();

      setTasks(tasksData.data || []);
      setActivity(activityData.data || []);
      setStats(statsData.data || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          createdBy: 'main',
        }),
      });

      if (response.ok) {
        setShowNewTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          status: 'backlog',
          priority: 'medium',
          agentId: 'main',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const moveTask = async (taskId: string, newStatus: Task['status']) => {
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const tasksByStatus = {
    recurring: tasks.filter(t => t.status === 'recurring'),
    backlog: tasks.filter(t => t.status === 'backlog'),
    progress: tasks.filter(t => t.status === 'progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-400">Lumen AI</h1>
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
          <button className="text-white font-bold border-b-2 border-purple-500 pb-1">Tasks</button>
          <button className="hover:text-white">Chat</button>
          <button className="hover:text-white">Council</button>
          <button className="hover:text-white">Calendar</button>
          <button className="hover:text-white">Projects</button>
          <button className="hover:text-white">Memory</button>
          <button className="hover:text-white">Captures</button>
          <button className="hover:text-white">Docs</button>
          <button className="hover:text-white">People</button>
          <button className="hover:text-white">Search</button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.tasksThisWeek}</div>
            <div className="text-sm text-gray-400">This week</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-sm text-gray-400">In progress</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.completion}%</div>
            <div className="text-sm text-gray-400">Completion</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold"
        >
          + New task
        </button>
        <select className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
          <option>Alex</option>
          <option>Henry</option>
          <option>All agents</option>
        </select>
        <select className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
          <option>All projects</option>
        </select>
      </div>

      {/* Kanban Board + Activity Feed */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recurring Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recurring</h2>
            <span className="text-sm text-gray-400">{tasksByStatus.recurring.length}</span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.recurring.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-8">No tasks</div>
            )}
            {tasksByStatus.recurring.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3 cursor-move">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-2 h-2 rounded-full ${priorityColor(task.priority)} mt-1`} />
                  <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 text-xs">×</button>
                </div>
                <div className="font-bold text-sm mb-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</div>
                )}
                <div className="text-xs text-gray-500">{task.project?.name || task.agentId} · {timeAgo(task.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backlog Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Backlog</h2>
            <span className="text-sm text-gray-400">{tasksByStatus.backlog.length}</span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.backlog.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3 cursor-move">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-2 h-2 rounded-full ${priorityColor(task.priority)} mt-1`} />
                  <div className="flex gap-2">
                    <button onClick={() => moveTask(task.id, 'progress')} className="text-gray-500 hover:text-green-500 text-xs">→</button>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 text-xs">×</button>
                  </div>
                </div>
                <div className="font-bold text-sm mb-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</div>
                )}
                <div className="text-xs text-gray-500">{task.project?.name || task.agentId} · {timeAgo(task.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">In Progress</h2>
            <span className="text-sm text-gray-400">{tasksByStatus.progress.length}</span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.progress.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3 cursor-move">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-2 h-2 rounded-full ${priorityColor(task.priority)} mt-1`} />
                  <div className="flex gap-2">
                    <button onClick={() => moveTask(task.id, 'done')} className="text-gray-500 hover:text-blue-500 text-xs">✓</button>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 text-xs">×</button>
                  </div>
                </div>
                <div className="font-bold text-sm mb-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</div>
                )}
                {task.progress > 0 && (
                  <div className="mb-2">
                    <div className="bg-gray-700 rounded-full h-1">
                      <div className="bg-purple-500 rounded-full h-1" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500">{task.project?.name || task.agentId} · {timeAgo(task.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Done</h2>
            <span className="text-sm text-gray-400">{tasksByStatus.done.length}</span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.done.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3 opacity-60">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-green-500 text-sm">✓</div>
                  <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 text-xs">×</button>
                </div>
                <div className="font-bold text-sm mb-1 line-through">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</div>
                )}
                <div className="text-xs text-gray-500">{task.project?.name || task.agentId} · {timeAgo(task.updatedAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="font-bold mb-4">ACTIVITY</h2>
          <div className="space-y-3 text-sm">
            {activity.map(item => (
              <div key={item.id} className="text-gray-400">
                <div className="text-white mb-1">• {item.title}</div>
                <div className="text-xs text-gray-600">{timeAgo(item.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-gray-800 rounded px-3 py-2"
                  placeholder="Task title"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-gray-800 rounded px-3 py-2 h-24"
                  placeholder="Task description (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                    className="w-full bg-gray-800 rounded px-3 py-2"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="progress">In Progress</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-gray-800 rounded px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createTask}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-bold"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
