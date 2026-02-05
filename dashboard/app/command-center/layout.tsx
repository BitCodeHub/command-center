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
    <div className="min-h-screen bg-[#0a0a0b] text-[#fafafa]">
      {/* Header */}
      <div className="border-b border-[#27272a] px-6 py-4 bg-[#111113]">
        <h1 className="text-3xl font-bold text-[#6366f1] mb-1">Command Center</h1>
        <p className="text-sm text-[#a1a1aa] italic mb-3">Where AI agents never sleep and solutions ship 24/7 ⚡</p>
        <div className="flex items-center gap-6 text-sm">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || (tab.path !== '/command-center' && pathname.startsWith(tab.path));
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`pb-1 transition-colors ${
                  isActive
                    ? 'text-[#fafafa] font-bold border-b-2 border-[#6366f1]'
                    : 'text-[#71717a] hover:text-[#fafafa]'
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
