'use client';

export default function DocsPage() {
  const docCategories = [
    {
      name: 'System Documentation',
      icon: '⚙️',
      items: [
        'AGENTS.md - Agent workspace guide',
        'SOUL.md - Agent personality',
        'IDENTITY.md - Role definitions',
        'USER.md - User preferences',
        'TOOLS.md - Local tool config',
      ],
    },
    {
      name: 'Build Plans',
      icon: '📋',
      items: [
        'COMMAND_CENTER_BUILD_PLAN.md',
        'TRANSCRIBE_ME_BUILD_PLAN.md',
        'Agent architecture specs',
        'Integration guides',
      ],
    },
    {
      name: 'Skills',
      icon: '🎯',
      items: [
        'GitHub skill (gh CLI)',
        'Weather skill',
        'Notion skill',
        'N8N workflow builder',
        'SEO analyst',
      ],
    },
    {
      name: 'Company',
      icon: '🏢',
      items: [
        'TEAM_ROSTER.md - 147 agents',
        'Department structure',
        'Agent roles & responsibilities',
        'Onboarding guides',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-[#111113] rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">Documentation</h2>
          <p className="text-[#a1a1aa]">
            Central repository for all system documentation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docCategories.map((category, i) => (
            <div key={i} className="bg-[#18181b] rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </h3>
              <ul className="space-y-2">
                {category.items.map((item, j) => (
                  <li key={j} className="text-sm text-[#a1a1aa] hover:text-white cursor-pointer transition-colors">
                    → {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-[#18181b] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#6366f1]">50+</div>
            <div className="text-xs text-[#a1a1aa] mt-1">Documentation Files</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#6366f1]">10+</div>
            <div className="text-xs text-[#a1a1aa] mt-1">Active Skills</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#6366f1]">147</div>
            <div className="text-xs text-[#a1a1aa] mt-1">Agent Profiles</div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-purple-900/20 border border-purple-800 rounded-lg text-center">
          <p className="text-purple-300 text-sm">
            🚧 Interactive doc browser and editor coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
