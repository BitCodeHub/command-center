'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  agentId?: string;
  createdAt: string;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      const data = await response.json();
      setTasks(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const tasksWithDueDate = tasks.filter(t => t.dueDate);
  const recurringTasks = tasks.filter(t => t.status === 'recurring');

  if (loading) {
    return <div className="text-center py-12 text-[#a1a1aa]">Loading calendar...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{recurringTasks.length}</div>
          <div className="text-sm text-[#a1a1aa]">Recurring Tasks</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{tasksWithDueDate.length}</div>
          <div className="text-sm text-[#a1a1aa]">Scheduled Tasks</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'progress').length}</div>
          <div className="text-sm text-[#a1a1aa]">In Progress</div>
        </div>
      </div>

      {/* Recurring Tasks */}
      <div className="bg-[#111113] rounded-lg mb-6">
        <div className="border-b border-[#27272a] p-4">
          <h2 className="text-xl font-bold">🔄 Recurring Tasks</h2>
        </div>
        <div className="p-4 space-y-3">
          {recurringTasks.length === 0 && (
            <div className="text-center py-8 text-[#71717a]">No recurring tasks</div>
          )}
          {recurringTasks.map((task) => (
            <div key={task.id} className="bg-[#18181b] rounded-lg p-3">
              <div className="font-bold">{task.title}</div>
              {task.description && (
                <div className="text-sm text-[#a1a1aa] mt-1">{task.description}</div>
              )}
              <div className="text-xs text-[#71717a] mt-2">Agent: {task.agentId}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Tasks */}
      <div className="bg-[#111113] rounded-lg">
        <div className="border-b border-[#27272a] p-4">
          <h2 className="text-xl font-bold">📅 Scheduled Tasks</h2>
        </div>
        <div className="p-4 space-y-3">
          {tasksWithDueDate.length === 0 && (
            <div className="text-center py-8 text-[#71717a]">No scheduled tasks</div>
          )}
          {tasksWithDueDate
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .map((task) => (
              <div key={task.id} className="bg-[#18181b] rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-[#a1a1aa] mt-1">{task.description}</div>
                    )}
                  </div>
                  <div className="text-sm text-[#6366f1] ml-4">
                    {new Date(task.dueDate!).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-[#71717a] mt-2">Agent: {task.agentId}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#111113] rounded-lg text-center text-[#71717a] text-sm">
        📆 Full calendar view coming soon
      </div>
    </div>
  );
}
