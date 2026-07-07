'use client';

import { useTheme } from './theme-provider';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <IconMoon className="h-4 w-4" />
      ) : (
        <IconSun className="h-4 w-4" />
      )}
      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}
