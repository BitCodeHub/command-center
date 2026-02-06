'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface AgentStatus {
  id: string;
  agentId: string;
  name: string;
  role: string;
  emoji: string;
  department: string;
  location: string;
  status: 'idle' | 'working' | 'blocked' | 'completed';
  currentTask: string | null;
  progress: number | null;
  lastUpdate: string;
}

export default function CouncilPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    
    // WebSocket for instant updates
    const ws = new WebSocket('wss://command-center-api.onrender.com/api/status/stream');
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected (Council)');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'status_update') {
          fetchAgents(); // Refresh instantly
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    };
    
    return () => {
      ws.close();
    };
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status`);
      const data = await response.json();
      setAgents(data.statuses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
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
    return <div className="text-center py-12 text-[#a1a1aa]">Loading agents...</div>;
  }

  // Group by department
  const byDepartment = agents.reduce((acc, agent) => {
    if (!acc[agent.department]) acc[agent.department] = [];
    acc[agent.department].push(agent);
    return acc;
  }, {} as Record<string, AgentStatus[]>);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-[#111113] rounded-lg">
        <div className="border-b border-[#27272a] p-4">
          <h2 className="text-xl font-bold">🏛️ Council - Agent Status</h2>
          <p className="text-sm text-[#a1a1aa] mt-1">{agents.length} agents online</p>
        </div>

        <div className="p-4 space-y-6">
          {Object.entries(byDepartment).map(([dept, deptAgents]) => (
            <div key={dept}>
              <h3 className="text-lg font-bold mb-3">{dept}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {deptAgents.map((agent) => (
                  <div key={agent.id} className="bg-[#18181b] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div>
                          <div className="font-bold">{agent.name}</div>
                          <div className="text-xs text-[#71717a]">{agent.role}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColor(agent.status)}`} />
                    </div>
                    
                    {agent.currentTask && (
                      <div className="mt-3 p-2 bg-[#111113] rounded text-sm">
                        <div className="text-[#a1a1aa] mb-1">Current Task:</div>
                        <div>{agent.currentTask}</div>
                        {agent.progress !== null && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-[#71717a] mb-1">
                              <span>Progress</span>
                              <span>{agent.progress}%</span>
                            </div>
                            <div className="w-full bg-[#27272a] rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${agent.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!agent.currentTask && (
                      <div className="mt-3 text-sm text-[#71717a]">
                        Idle - Last active {timeAgo(agent.lastUpdate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
