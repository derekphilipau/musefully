'use client';

import * as React from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';
import { useTheme } from 'next-themes';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const dict = getDictionary();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={dict['button.toggleTheme']}
        >
          <Icons.sun className="rotate-0 scale-100 transition-all hover:text-neutral-900 dark:-rotate-90 dark:scale-0 dark:text-neutral-400 dark:hover:text-neutral-100" />
          <Icons.moon className="absolute rotate-90 scale-0 transition-all hover:text-neutral-900 dark:rotate-0 dark:scale-100 dark:text-neutral-400 dark:hover:text-neutral-100" />
          <span className="sr-only">{dict['button.toggleTheme']}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Icons.sun className="mr-2 h-4 w-4" />
          <span>{dict['nav.theme.light']}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Icons.moon className="mr-2 h-4 w-4" />
          <span>{dict['nav.theme.dark']}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Icons.laptop className="mr-2 h-4 w-4" />
          <span>{dict['nav.theme.system']}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
