import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface FooterProps {
  items?: NavItem[];
}

export function Footer({ items }: FooterProps) {
  const dict = getDictionary(); // en

  return (
    <div className="container p-6">
      <div className="mt-10 md:flex md:items-center md:justify-between md:space-x-6">
        <div>
          <Link
            href="/"
            className="mb-2 flex items-center space-x-2 text-xl font-bold"
          >
            {dict['site.title']}
          </Link>
          {}
          <p className="text-xs">{dict['footer.text']}</p>
        </div>
        <div className="mt-6 md:mt-0">
          <h5 className="mb-2 text-lg">{dict['footer.marketing.text']}</h5>
          <Input
            name="marketing"
            placeholder={dict['footer.marketing.placeholder']}
          />
        </div>
      </div>
      {items?.length ? (
        <nav
          className="mb-10 mt-6 flex gap-6"
          aria-label={dict['nav.footerMenu']}
        >
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center text-lg font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-100 sm:text-sm',
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
