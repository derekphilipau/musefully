'use client';

import * as React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import { useTheme } from 'next-themes';

import type { NavItem } from '@/types/nav';
import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainNavProps {
  items?: NavItem[];
}

export function MobileNav({ items }: MainNavProps) {
  const dict = getDictionary();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="-mr-2 text-2xl font-bold hover:bg-transparent focus:ring-0"
          aria-label={dict['button.openMenu']}
        >
          <Icons.menu className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={24}
        className="w-[300px] overflow-scroll"
      >
        <DropdownMenuLabel className="text-xs leading-none text-muted-foreground">
          {dict['site.title']}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link role="button" href="/">
            {dict['nav.home']}
          </Link>
        </DropdownMenuItem>
        {items?.map(
          (item, index) =>
            item.href && (
              <DropdownMenuItem key={index} asChild>
                <Link role="button" href={item.href}>
                  {dict[item.dict]}
                </Link>
              </DropdownMenuItem>
            )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs leading-none text-muted-foreground">
          Links
        </DropdownMenuLabel>
        {siteConfig?.links?.github && (
          <DropdownMenuItem asChild>
            <Link
              role="button"
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <Icons.github className="mr-2 h-5 w-5" />
              Github
            </Link>
          </DropdownMenuItem>
        )}
        {siteConfig?.links?.instagram && (
          <DropdownMenuItem asChild>
            <Link
              role="button"
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
            >
              <Icons.instagram className="mr-2 h-5 w-5" />
              Instagram
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs leading-none text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Icons.sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Icons.moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Icons.laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
