'use client';

export default function CapturesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-2xl font-bold mb-2">Captures - Screenshots & Recordings</h2>
        <p className="text-gray-400 mb-8">
          Visual documentation and screen recordings from agent activities
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">📷 Screenshots</h3>
            <p className="text-sm text-gray-400 mb-4">
              Capture important moments and UI states
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Browser snapshots</div>
              <div>• Error states</div>
              <div>• Success moments</div>
              <div>• UI references</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">🎥 Recordings</h3>
            <p className="text-sm text-gray-400 mb-4">
              Screen and video recordings
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Demo videos</div>
              <div>• Bug reproductions</div>
              <div>• Tutorial content</div>
              <div>• Process documentation</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">🏷️ Organization</h3>
            <p className="text-sm text-gray-400 mb-4">
              Smart tagging and search
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Auto-tagging</div>
              <div>• Date sorting</div>
              <div>• Project linking</div>
              <div>• Agent attribution</div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
          <p className="text-purple-300 text-sm">
            🚧 Capture gallery coming soon - Integrates with browser and canvas tools
          </p>
        </div>
      </div>
    </div>
  );
}
