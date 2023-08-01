import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface SearchIndexButtonProps {
  index: string;
  params?: any;
  name: string;
  label: string;
}

export function SearchIndexButton({
  index,
  params,
  name,
  label,
}: SearchIndexButtonProps) {
  function getIndexHref() {
    const newParams = new URLSearchParams();
    if (name === 'collections') newParams.set('hasPhoto', 'true');
    if (params?.q) newParams.set('q', params.q);
    if (params?.layout) newParams.set('layout', params.layout);
    if (params?.f) newParams.set('f', params.f);
    return `/search/${name}?${newParams}`;
  }

  return (
    <Link
      className={cn(
        index === name && 'pointer-events-none',
        'text-base sm:text-lg',
        buttonVariants({
          variant: index === name ? 'outline' : 'ghost',
        })
      )}
      href={getIndexHref()}
      aria-label={`Search within ${label}`}
    >
      {label}
    </Link>
  );
}
