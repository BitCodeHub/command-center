'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface Project {
  id: string;
  name: string;
  code?: string;
  description?: string;
  owner: string;
  status: string;
  progress: number;
  location?: string;
  nextMilestone?: string;
  blockers?: string[];
  tags?: string[];
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      const url = filter === 'all' 
        ? `${API_URL}/api/projects` 
        : `${API_URL}/api/projects?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProjects(data.projects || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const projectsByStatus = {
    active: projects.filter(p => p.status === 'active'),
    paused: projects.filter(p => p.status === 'paused'),
    completed: projects.filter(p => p.status === 'completed'),
    archived: projects.filter(p => p.status === 'archived'),
  };

  if (loading) {
    return <div className="text-center py-12 text-[#a1a1aa]">Loading projects...</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{projectsByStatus.active.length}</div>
          <div className="text-sm text-[#a1a1aa]">Active</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{projectsByStatus.paused.length}</div>
          <div className="text-sm text-[#a1a1aa]">Paused</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{projectsByStatus.completed.length}</div>
          <div className="text-sm text-[#a1a1aa]">Completed</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{projects.length}</div>
          <div className="text-sm text-[#a1a1aa]">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {['all', 'active', 'paused', 'completed', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? 'bg-[#6366f1] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#111113] rounded-lg p-4 hover:bg-[#18181b] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                {project.code && (
                  <div className="text-xs text-[#71717a]">{project.code}</div>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs ${statusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-[#a1a1aa] mb-3 line-clamp-2">{project.description}</p>
            )}

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="bg-[#27272a] rounded-full h-2">
                <div
                  className="bg-[#6366f1] rounded-full h-2"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 text-xs text-[#71717a]">
              <div>Owner: <span className="text-[#a1a1aa]">{project.owner}</span></div>
              {project.location && (
                <div>Location: <span className="text-[#a1a1aa]">{project.location}</span></div>
              )}
              {project.nextMilestone && (
                <div>Next: <span className="text-[#a1a1aa]">{project.nextMilestone}</span></div>
              )}
              {project.blockers && project.blockers.length > 0 && (
                <div className="text-yellow-500">⚠️ {project.blockers.length} blocker(s)</div>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {project.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#18181b] rounded text-xs text-[#a1a1aa]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-[#71717a]">
          No projects found
        </div>
      )}
    </div>
  );
}
