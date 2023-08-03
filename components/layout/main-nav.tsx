import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import logoIcon from '@/public/favicon.svg';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const dict = getDictionary();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-xl font-bold"
      >
        <Image
          src={logoIcon}
          className="h-10 object-contain md:mr-4"
          alt={dict['site.title']}
        />
        <span className="hidden md:block">{dict['site.title']}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6" aria-label={dict['button.mainMenu']}>
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center text-lg font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-100',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                >
                  {dict[item.dict]}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  );
}
