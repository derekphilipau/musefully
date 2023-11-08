'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { AggOptions } from '@/types/aggregation';
import {
  toggleIsShowFilters,
  toURLSearchParams,
  type SearchParams,
} from '@/lib/elasticsearch/search/searchParams';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SearchFilters } from './search-filters';

interface SearchFilterButtonProps {
  searchParams: SearchParams;
  options: AggOptions;
  isShowFilters: boolean;
}

export function SearchFilterButton({
  searchParams,
  options,
  isShowFilters,
}: SearchFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  useEffect(() => {
    setOpen(false);
  }, [pathname, currentSearchParams]);

  function toggleFilters() {
    const updatedParams = toURLSearchParams(toggleIsShowFilters(searchParams));
    router.push(`${pathname}?${updatedParams}`);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
            aria-label={
              isShowFilters
                ? dict['search.hideFilters']
                : dict['search.showFilters']
            }
          >
            <Icons.slidersHorizontal className="mr-2 h-5 w-5" />
            {dict['search.filters']}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full pr-0 min-[360px]:w-3/4">
          <ScrollArea className="h-[calc(100vh-3rem)] pr-4">
            <h4 className="mb-4 font-medium">Search Filters</h4>
            <div className="flex flex-col items-start justify-between gap-y-2">
              <SearchFilters searchParams={searchParams} options={options} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Button
        onClick={() => toggleFilters()}
        variant="ghost"
        size="sm"
        aria-label={
          isShowFilters
            ? dict['search.hideFilters']
            : dict['search.showFilters']
        }
        className="hidden sm:flex"
      >
        <Icons.slidersHorizontal className="mr-2 h-5 w-5" />
        {dict['search.filters']}
      </Button>
    </>
  );
}
