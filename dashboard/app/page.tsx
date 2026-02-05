'use client';

import { useEffect, useState } from 'react';

interface AgentStatus {
  id: string;
  agentId: string;
  name: string;
  role: string;
  emoji: string;
  department: string;
  location: string;
  status: 'working' | 'idle' | 'blocked' | 'completed';
  currentTask?: string;
  progress?: number;
  blockers?: string[];
  lastUpdate: string;
}

interface Project {
  id: string;
  name: string;
  owner: string;
  status: string;
  progress: number;
  nextMilestone?: string;
  blockers?: string[];
}

export default function CommandCenter() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

  useEffect(() => {
    // Fetch initial data
    Promise.all([
      fetch(`${API_URL}/api/status`).then(r => r.json()),
      fetch(`${API_URL}/api/projects`).then(r => r.json())
    ]).then(([statusRes, projectsRes]) => {
      setStatuses(statusRes.statuses || []);
      setProjects(projectsRes.projects || []);
      setLoading(false);
    });

    // WebSocket for real-time updates
    const ws = new WebSocket(`${WS_URL}/api/status/stream`);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'status_update') {
        setStatuses(prev => {
          const index = prev.findIndex(s => s.agentId === message.data.agentId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = message.data;
            return updated;
          } else {
            return [...prev, message.data];
          }
        });
      }
    };
    
    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    return () => ws.close();
  }, [API_URL, WS_URL]);

  const executives = statuses.filter(s => s.department === 'Executive');
  const departments = statuses.filter(s => s.department !== 'Executive');
  
  const statusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500';
      case 'blocked': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const statusCounts = {
    total: statuses.length,
    working: statuses.filter(s => s.status === 'working').length,
    idle: statuses.filter(s => s.status === 'idle').length,
    blocked: statuses.filter(s => s.status === 'blocked').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎯 Command Center</h1>
            <p className="text-gray-400">Lumen AI Solutions - Real-time Operations Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">WebSocket</div>
              <div className={`text-sm font-bold ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Agents</div>
          <div className="text-3xl font-bold">{statusCounts.total}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Active Now</div>
          <div className="text-3xl font-bold text-green-400">{statusCounts.working}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Idle</div>
          <div className="text-3xl font-bold text-gray-400">{statusCounts.idle}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Blocked</div>
          <div className="text-3xl font-bold text-yellow-400">{statusCounts.blocked}</div>
        </div>
      </div>

      {/* Executive Board */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">👥 Executive Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {executives.map(agent => (
            <div key={agent.id} className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.role}</div>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${statusColor(agent.status)}`} />
              </div>
              {agent.currentTask && (
                <div className="text-sm text-gray-300 mt-2">
                  📋 {agent.currentTask}
                </div>
              )}
              {agent.progress !== undefined && agent.progress > 0 && (
                <div className="mt-2">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2" 
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{agent.progress}%</div>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {new Date(agent.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Heads */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🏢 Department Heads</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {departments.map(agent => (
            <div key={agent.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{agent.emoji}</span>
                <div className={`w-2 h-2 rounded-full ${statusColor(agent.status)}`} />
              </div>
              <div className="font-bold text-sm">{agent.name}</div>
              <div className="text-xs text-gray-400">{agent.department}</div>
              {agent.currentTask && (
                <div className="text-xs text-gray-300 mt-2 truncate">{agent.currentTask}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 Active Projects</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-3">Project</th>
                <th className="text-left p-3">Owner</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Next Milestone</th>
                <th className="text-left p-3">Blockers</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const owner = statuses.find(s => s.agentId === project.owner);
                return (
                  <tr key={project.id} className="border-t border-gray-700">
                    <td className="p-3 font-bold">{project.name}</td>
                    <td className="p-3">
                      {owner && (
                        <span className="flex items-center gap-1">
                          <span>{owner.emoji}</span>
                          <span className="text-sm">{owner.name}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'in_progress' ? 'bg-blue-600' :
                        project.status === 'planned' ? 'bg-gray-600' :
                        project.status === 'blocked' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-700 rounded-full h-2 w-24">
                          <div 
                            className="bg-blue-500 rounded-full h-2" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-300">{project.nextMilestone || '—'}</td>
                    <td className="p-3">
                      {project.blockers && project.blockers.length > 0 ? (
                        <span className="text-xs text-yellow-400">{project.blockers[0]}</span>
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
