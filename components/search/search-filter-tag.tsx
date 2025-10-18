'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import {
  SearchParams,
  toURLSearchParams,
} from '@/lib/elasticsearch/search/searchParams';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';
import { sources } from '@/config/sources';

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
    const existingValues = updatedParams
      .getAll(name)
      .filter((paramValue) => paramValue !== value);

    updatedParams.delete(name);
    for (const paramValue of existingValues) {
      updatedParams.append(name, paramValue);
    }
    updatedParams.delete('p');
    const queryString = updatedParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
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
        <div>
          {name === 'sourceId' ? sources[value]?.name || value : value}
        </div>
      )}
      <Icons.x className="ml-2 size-4" />
    </Button>
  );
}
