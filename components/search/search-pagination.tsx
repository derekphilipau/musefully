'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { AggOptions } from '@/types/aggregation';
import {
  CARD_COLOR,
  CARD_PALETTE,
  CARD_SWATCH,
  LAYOUT_GRID,
  LAYOUT_LIST,
  setCardType,
  setLayoutType,
  setPageNumber,
  setResultsPerPage,
  setSortBy,
  SORT_ORDER_ASC,
  SORT_ORDER_DEFAULT,
  SORT_ORDER_DESC,
  toURLSearchParams,
  type SearchParams,
  type SortOrder,
} from '@/lib/elasticsearch/search/searchParams';
import { Icons } from '@/components/icons';
import { SearchFilterButton } from '@/components/search/search-filter-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchPaginationProps {
  searchParams: SearchParams;
  isShowViewOptions: boolean;
  options: AggOptions;
  count: number;
  totalPages: number;
}

export function SearchPagination({
  searchParams,
  isShowViewOptions,
  options,
  count,
  totalPages,
}: SearchPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dict = getDictionary();

  const showExperimental = false;

  const pageClick = useCallback(
    (newPage: number) => {
      const updatedParams = toURLSearchParams(
        setPageNumber(searchParams, newPage)
      );
      router.push(`${pathname}?${updatedParams}`);
      window.scroll(0, 0);
    },
    [searchParams, router, pathname]
  );

  const sizeChange = useCallback(
    (value: string) => {
      const updatedParams = toURLSearchParams(
        setResultsPerPage(searchParams, value)
      );
      router.push(`${pathname}?${updatedParams}`);
      window.scroll(0, 0);
    },
    [searchParams, router, pathname]
  );

  const sortBy = useCallback(
    (field: string, order: SortOrder = SORT_ORDER_DEFAULT) => {
      const updatedParams = toURLSearchParams(
        setSortBy(searchParams, field, order)
      );
      router.push(`${pathname}?${updatedParams}`);
      window.scroll(0, 0);
    },
    [searchParams, router, pathname]
  );

  const onClickChangeLayoutType = useCallback(
    (layout: string) => {
      const updatedParams = toURLSearchParams(
        setLayoutType(searchParams, layout)
      );
      router.push(`${pathname}?${updatedParams}`);
    },
    [searchParams, router, pathname]
  );

  const onClickChangeCardType = useCallback(
    (card: string) => {
      const updatedParams = toURLSearchParams(setCardType(searchParams, card));
      router.push(`${pathname}?${updatedParams}`);
    },
    [searchParams, router, pathname]
  );

  const sortDropdownMenuItem = useCallback(
    (fieldName: string, order: SortOrder) => {
      const label = dict[`search.sort.${fieldName}.${order}`];
      const mySortField = searchParams.sortField;
      const mySortOrder = searchParams.sortOrder;
      const isActive = fieldName === mySortField && mySortOrder === order;

      return (
        <DropdownMenuItem
          key={`${fieldName}-${order}`}
          onClick={() => sortBy(fieldName, order)}
          disabled={isActive}
        >
          {order === SORT_ORDER_ASC ? (
            <Icons.arrowDown className="mr-2 size-5" />
          ) : (
            <Icons.arrowUp className="mr-2 size-5" />
          )}
          <span>{label}</span>
          {isActive && <Icons.check className="ml-2 size-5" />}
        </DropdownMenuItem>
      );
    },
    [dict, searchParams.sortField, searchParams.sortOrder, sortBy]
  );

  const isPreviousDisabled = useMemo(
    () => searchParams.pageNumber <= 1,
    [searchParams.pageNumber]
  );
  const isNextDisabled = useMemo(
    () => searchParams.pageNumber >= totalPages,
    [searchParams.pageNumber, totalPages]
  );

  return (
    <nav
      className="items-start justify-between gap-x-4 sm:flex"
      aria-label={dict['button.pagination']}
    >
      <div className="flex flex-wrap items-center justify-start gap-1">
        {isShowViewOptions && (
          <>
            <div>
              <SearchFilterButton
                searchParams={searchParams}
                options={options}
                isShowFilters={searchParams.isShowFilters}
              />
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onClickChangeLayoutType(LAYOUT_GRID)}
                      variant="ghost"
                      size="sm"
                      disabled={searchParams.layout === LAYOUT_GRID}
                      aria-label={dict['search.layoutGrid']}
                    >
                      <Icons.layoutGrid className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dict['search.layoutGrid']}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onClickChangeLayoutType(LAYOUT_LIST)}
                      variant="ghost"
                      size="sm"
                      disabled={searchParams.layout === LAYOUT_LIST}
                      aria-label={dict['search.layoutList']}
                    >
                      <Icons.layoutList className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dict['search.layoutList']}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={dict['search.cardSwatch']}
                  >
                    <Icons.arrowUpDown className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>
                    {dict['search.sort.label']}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {sortDropdownMenuItem('startYear', SORT_ORDER_ASC)}
                    {sortDropdownMenuItem('startYear', SORT_ORDER_DESC)}
                    {sortDropdownMenuItem('title', SORT_ORDER_ASC)}
                    {sortDropdownMenuItem('title', SORT_ORDER_DESC)}
                    {sortDropdownMenuItem(
                      'primaryConstituent.canonicalName',
                      SORT_ORDER_ASC
                    )}
                    {sortDropdownMenuItem(
                      'primaryConstituent.canonicalName',
                      SORT_ORDER_DESC
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {showExperimental && (
              <>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onClickChangeCardType(CARD_SWATCH)}
                          variant={
                            searchParams.cardType === CARD_SWATCH
                              ? 'default'
                              : 'ghost'
                          }
                          size="sm"
                          aria-label={dict['search.cardSwatch']}
                        >
                          <Icons.paintbrush2 className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dict['search.cardSwatch']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onClickChangeCardType(CARD_PALETTE)}
                          variant={
                            searchParams.cardType === CARD_PALETTE
                              ? 'default'
                              : 'ghost'
                          }
                          size="sm"
                          aria-label={dict['search.cardPalette']}
                        >
                          <Icons.palette className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dict['search.cardPalette']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onClickChangeCardType(CARD_COLOR)}
                          variant={
                            searchParams.cardType === CARD_COLOR
                              ? 'default'
                              : 'ghost'
                          }
                          size="sm"
                          aria-label={dict['search.cardColor']}
                        >
                          <Icons.pipette className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dict['search.cardColor']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
            <div className="flex w-16">
              <Select
                value={searchParams.resultsPerPage.toString()}
                onValueChange={(value) => sizeChange(value)}
              >
                <SelectTrigger
                  className="w-[180px]"
                  aria-label={dict['button.resultsPerPage']}
                >
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="ml-2 text-xs">
          {count} {dict['search.resultsPage']} {searchParams.pageNumber}{' '}
          {dict['search.of']} {totalPages}.
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-x-4 sm:mt-0">
        <Button
          disabled={isPreviousDisabled}
          onClick={() => pageClick(searchParams.pageNumber - 1)}
          variant="ghost"
          size="sm"
          aria-label={dict['search.previous']}
        >
          <Icons.chevronLeft className="mr-2 size-5" aria-hidden="true" />
          <span className="">{dict['search.previous']}</span>
        </Button>
        <Button
          disabled={isNextDisabled}
          onClick={() => pageClick(searchParams.pageNumber + 1)}
          variant="ghost"
          size="sm"
          aria-label={dict['search.next']}
        >
          <span className="">{dict['search.next']}</span>
          <Icons.chevronRight className="ml-2 size-5" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
