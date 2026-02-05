'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface SearchResult {
  type: 'task' | 'project' | 'agent' | 'activity';
  id: string;
  title: string;
  description?: string;
  metadata?: any;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      // Search across multiple endpoints
      const [tasksRes, projectsRes, agentsRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/tasks`),
        fetch(`${API_URL}/api/projects`),
        fetch(`${API_URL}/api/agents`),
        fetch(`${API_URL}/api/activity?limit=50`),
      ]);

      const [tasksData, projectsData, agentsData, activityData] = await Promise.all([
        tasksRes.json(),
        projectsRes.json(),
        agentsRes.json(),
        activityRes.json(),
      ]);

      const searchResults: SearchResult[] = [];

      // Search tasks
      (tasksData.data || [])
        .filter((t: any) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description?.toLowerCase().includes(query.toLowerCase())
        )
        .forEach((t: any) => {
          searchResults.push({
            type: 'task',
            id: t.id,
            title: t.title,
            description: t.description,
            metadata: { status: t.status, agentId: t.agentId },
          });
        });

      // Search projects
      (projectsData.projects || [])
        .filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
        )
        .forEach((p: any) => {
          searchResults.push({
            type: 'project',
            id: p.id,
            title: p.name,
            description: p.description,
            metadata: { status: p.status, owner: p.owner },
          });
        });

      // Search agents
      (agentsData.data || [])
        .filter((a: any) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.role.toLowerCase().includes(query.toLowerCase()) ||
          a.department?.toLowerCase().includes(query.toLowerCase())
        )
        .forEach((a: any) => {
          searchResults.push({
            type: 'agent',
            id: a.id,
            title: `${a.emoji} ${a.name}`,
            description: a.role,
            metadata: { department: a.department, status: a.status },
          });
        });

      // Search activity
      (activityData.data || [])
        .filter((act: any) =>
          act.title.toLowerCase().includes(query.toLowerCase()) ||
          act.description?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10) // Limit activity results
        .forEach((act: any) => {
          searchResults.push({
            type: 'activity',
            id: act.id,
            title: act.title,
            description: act.description,
            metadata: { agentId: act.agentId, type: act.type },
          });
        });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'project': return '📊';
      case 'agent': return '👤';
      case 'activity': return '📝';
      default: return '•';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-purple-900 text-purple-300';
      case 'project': return 'bg-blue-900 text-blue-300';
      case 'agent': return 'bg-green-900 text-green-300';
      case 'activity': return 'bg-gray-800 text-gray-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search tasks, projects, agents, activity..."
            className="flex-1 bg-gray-900 rounded-lg px-6 py-4 text-lg"
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-bold disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          💡 Try searching for agent names, task titles, project names, or activities
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${typeColor(result.type)}`}>
                    {typeIcon(result.type)} {result.type}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-1">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-gray-400 mb-2">{result.description}</div>
                    )}
                    {result.metadata && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span key={key}>
                            {key}: <span className="text-gray-400">{String(value)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <div className="text-center py-12 text-gray-500">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {!query && (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">
            Search across all tasks, projects, agents, and activity
          </p>
        </div>
      )}
    </div>
  );
}
