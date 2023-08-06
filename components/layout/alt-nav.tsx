import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { buttonVariants } from '@/components/ui/button';

export function AltNav() {
  return (
    <>
      {siteConfig?.links?.github && (
        <Link
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={buttonVariants({
              size: 'sm',
              variant: 'ghost',
              className: 'text-neutral-700 dark:text-neutral-400',
            })}
          >
            <Icons.github className="h-5 w-5" />
            <span className="sr-only">Github</span>
          </div>
        </Link>
      )}
      {siteConfig?.links?.instagram && (
        <Link
          href={siteConfig.links.instagram}
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={buttonVariants({
              size: 'sm',
              variant: 'ghost',
              className: 'text-neutral-700 dark:text-neutral-400',
            })}
          >
            <Icons.instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </div>
        </Link>
      )}
      <ThemeToggle />
    </>
  );
}
