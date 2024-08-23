'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import {
  SearchParams,
  toURLSearchParams,
} from '@/lib/elasticsearch/search/searchParams';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';

interface SearchFilterTagProps {
  params?: SearchParams;
  name: string;
  value: string;
}

export function SearchFilterTag({ params, name, value }: SearchFilterTagProps) {
  const router = useRouter();
  const pathname = usePathname();

  const dict = getDictionary();

  function buttonClick() {
    const updatedParams = toURLSearchParams(params);
    updatedParams.delete(name);
    updatedParams.delete('p');
    router.push(`${pathname}?${updatedParams}`);
  }

  return (
    <Button
      onClick={() => buttonClick()}
      aria-label={dict['button.removeFilter']}
      variant="outline"
      size="sm"
    >
      {name === 'color' ? (
        <Icons.circle
          className={`size-6 rounded-full`}
          style={{ backgroundColor: `#${value}`, color: `#${value}` }}
        />
      ) : (
        <div>{value}</div>
      )}
      <Icons.x className="ml-2 size-4" />
    </Button>
  );
}
