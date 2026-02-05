'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface Agent {
  id: string;
  agentId: string;
  name: string;
  role: string;
  emoji: string;
  department: string;
  location: string;
  status: string;
  currentTask?: string;
  progress?: number;
  lastUpdate: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  location: string;
  agentCount: number;
}

export default function PeoplePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsRes, deptsRes] = await Promise.all([
        fetch(`${API_URL}/api/agents`),
        fetch(`${API_URL}/api/departments`),
      ]);

      const agentsData = await agentsRes.json();
      const deptsData = await deptsRes.json();

      setAgents(agentsData.data || []);
      setDepartments(deptsData.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'working':
      case 'active':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredAgents = agents
    .filter((agent) => {
      if (filter !== 'all' && agent.department !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          agent.name.toLowerCase().includes(query) ||
          agent.role.toLowerCase().includes(query) ||
          agent.department.toLowerCase().includes(query)
        );
      }
      return true;
    });

  const agentsByLocation = {
    'Mac Studio HQ': filteredAgents.filter(a => a.location === 'Mac Studio HQ'),
    'Luna Labs VPS': filteredAgents.filter(a => a.location === 'Luna Labs VPS'),
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading people...</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{agents.length}</div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{departments.length}</div>
          <div className="text-sm text-gray-400">Departments</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{agentsByLocation['Mac Studio HQ'].length}</div>
          <div className="text-sm text-gray-400">Mac Studio HQ</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{agentsByLocation['Luna Labs VPS'].length}</div>
          <div className="text-sm text-gray-400">Luna Labs VPS</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-gray-900 rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Departments */}
      {departments
        .filter((dept) => filter === 'all' || dept.name === filter)
        .map((dept) => {
          const deptAgents = filteredAgents.filter((a) => a.department === dept.name);
          if (deptAgents.length === 0) return null;

          return (
            <div key={dept.id} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{dept.name}</h2>
                  <p className="text-sm text-gray-400">{dept.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {deptAgents.length} agent{deptAgents.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {deptAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div>
                          <div className="font-bold">{agent.name}</div>
                          <div className="text-xs text-gray-400">{agent.role}</div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColor(agent.status)}`} />
                    </div>

                    {agent.currentTask && (
                      <div className="text-sm text-gray-400 mb-2">
                        📋 {agent.currentTask}
                      </div>
                    )}

                    {agent.progress !== undefined && agent.progress > 0 && (
                      <div className="mb-2">
                        <div className="bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 rounded-full h-1.5"
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>{agent.location === 'Mac Studio HQ' ? '🏢 HQ' : '☁️ VPS'}</span>
                      <span className="capitalize">{agent.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 text-gray-500">No agents found</div>
      )}
    </div>
  );
}
