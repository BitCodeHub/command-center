'use client';

export default function MemoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-[#111113] rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-2">Memory - Knowledge Base</h2>
          <p className="text-[#a1a1aa]">
            Centralized knowledge repository for all agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#18181b] rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">📝 MEMORY.md</h3>
            <p className="text-sm text-[#a1a1aa] mb-4">
              Main memory file - curated long-term knowledge
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Key facts and decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Important context</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Lessons learned</span>
              </div>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">📅 Daily Notes</h3>
            <p className="text-sm text-[#a1a1aa] mb-4">
              Daily memory files (YYYY-MM-DD.md format)
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Raw daily logs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Activity tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Work progress</span>
              </div>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">🔍 Semantic Search</h3>
            <p className="text-sm text-[#a1a1aa] mb-4">
              memory_search tool for quick recall
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Fast retrieval</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Context-aware</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Relevance scoring</span>
              </div>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">📊 Memory Stats</h3>
            <p className="text-sm text-[#a1a1aa] mb-4">
              Knowledge base metrics
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">Total files</span>
                <span className="font-bold">~150</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">Daily notes</span>
                <span className="font-bold">~120</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">Key facts</span>
                <span className="font-bold">~30</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-purple-900/20 border border-purple-800 rounded-lg text-center">
          <p className="text-purple-300 text-sm">
            🚧 Memory browser and editor coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
