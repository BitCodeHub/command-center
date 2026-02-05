'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface Activity {
  id: string;
  type: string;
  agentId?: string;
  title: string;
  description?: string;
  createdAt: string;
  metadata?: any;
}

export default function ChatPage() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activity?type=message&limit=100`);
      const data = await response.json();
      setActivity(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity:', error);
      setLoading(false);
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
    return <div className="text-center py-12 text-[#a1a1aa]">Loading conversations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#111113] rounded-lg">
        <div className="border-b border-[#27272a] p-4">
          <h2 className="text-xl font-bold">Agent Conversations</h2>
          <p className="text-sm text-[#a1a1aa] mt-1">Real-time activity from all agents</p>
        </div>

        <div className="divide-y divide-gray-800">
          {activity.length === 0 && (
            <div className="p-8 text-center text-[#71717a]">
              No recent conversations
            </div>
          )}

          {activity.map((item) => (
            <div key={item.id} className="p-4 hover:bg-[#18181b] transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{item.agentId || 'System'}</span>
                    <span className="text-xs text-[#71717a]">{timeAgo(item.createdAt)}</span>
                  </div>
                  <div className="text-gray-300">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-[#a1a1aa] mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#111113] rounded-lg text-center text-[#71717a] text-sm">
        💬 Full chat interface coming soon
      </div>
    </div>
  );
}
