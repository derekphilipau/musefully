import * as React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { NavItem } from '@/types/nav';
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
import { AltNav } from './alt-nav';

interface MainNavProps {
  items?: NavItem[];
}

export function MobileNav({ items }: MainNavProps) {
  const dict = getDictionary();

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
        <DropdownMenuLabel>
          <Link href="/" className="flex items-center">
            {dict['site.title']}
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        <AltNav />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
