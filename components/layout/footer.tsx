import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';

interface FooterProps {
  items?: NavItem[];
}

export function Footer({ items }: FooterProps) {
  const dict = getDictionary(); // en

  return (
    <div className="container px-6 pb-10 pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div>
          {items?.length ? (
            <nav className="flex gap-6" aria-label={dict['nav.footerMenu']}>
              {items?.map(
                (item, index) =>
                  item.href && (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        'flex items-center text-lg font-semibold',
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
      </div>
    </div>
  );
}
