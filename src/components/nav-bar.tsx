'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconPhoto, IconUsers, IconAlbum, IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/photos', label: 'Photos', icon: IconPhoto },
  { href: '/faces', label: 'People', icon: IconUsers },
  { href: '/albums', label: 'Albums', icon: IconAlbum },
  { href: '/search', label: 'Search', icon: IconSearch },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col border-r p-4 md:flex">
        <Link href="/photos" className="mb-6 text-lg font-bold">Photos</Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-foreground text-background' : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
