'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Tasks', path: '/command-center' },
    { name: 'Chat', path: '/command-center/chat' },
    { name: 'Council', path: '/command-center/council' },
    { name: 'Calendar', path: '/command-center/calendar' },
    { name: 'Projects', path: '/command-center/projects' },
    { name: 'Memory', path: '/command-center/memory' },
    { name: 'Captures', path: '/command-center/captures' },
    { name: 'Docs', path: '/command-center/docs' },
    { name: 'People', path: '/command-center/people' },
    { name: 'Search', path: '/command-center/search' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-3xl font-bold text-purple-400 mb-4">Lumen AI</h1>
        <div className="flex items-center gap-6 text-sm">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || (tab.path !== '/command-center' && pathname.startsWith(tab.path));
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`pb-1 transition-colors ${
                  isActive
                    ? 'text-white font-bold border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
