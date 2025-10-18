'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import { useSearch } from '@/contexts/search-context';
import { useFilterVisibility } from '@/hooks/use-filter-visibility';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SearchFilters } from './search-filters';

function SearchFilterButtonComponent() {
  const [open, setOpen] = useState(false);
  const dict = getDictionary();
  const { searchParams } = useSearch();
  const { isVisible, toggleVisibility, isHydrated } = useFilterVisibility(
    searchParams.isShowFilters
  );
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const effectiveVisibility = isHydrated
    ? isVisible
    : searchParams.isShowFilters;

  useEffect(() => {
    setOpen(false);
  }, [pathname, currentSearchParams]);

  const onDesktopToggle = useCallback(() => {
    toggleVisibility(!effectiveVisibility);
  }, [toggleVisibility, effectiveVisibility]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
            aria-label={
              effectiveVisibility
                ? dict['search.hideFilters']
                : dict['search.showFilters']
            }
          >
            <Icons.slidersHorizontal className="mr-2 size-5" />
            {dict['search.filters']}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full pr-0 min-[360px]:w-3/4">
          <ScrollArea className="h-[calc(100vh-3rem)] pr-4">
            <SheetTitle className="mb-4 text-base font-medium">
              {dict['search.filters']}
            </SheetTitle>
            <div className="flex flex-col items-start justify-between gap-y-2">
              <SearchFilters />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Button
        onClick={onDesktopToggle}
        variant="ghost"
        size="sm"
        aria-label={
          effectiveVisibility
            ? dict['search.hideFilters']
            : dict['search.showFilters']
        }
        className="hidden sm:flex"
      >
        <Icons.slidersHorizontal className="mr-2 size-5" />
        {dict['search.filters']}
      </Button>
    </>
  );
}

export const SearchFilterButton = memo(SearchFilterButtonComponent);
