'use client';

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

  function pageClick(newPage: number) {
    const updatedParams = toURLSearchParams(
      setPageNumber(searchParams, newPage)
    );
    router.push(`${pathname}?${updatedParams}`);
    window.scroll(0, 0);
  }

  function sizeChange(value: string) {
    const updatedParams = toURLSearchParams(
      setResultsPerPage(searchParams, value)
    );
    router.push(`${pathname}?${updatedParams}`);
    window.scroll(0, 0);
  }

  function sortBy(field: string, order: SortOrder = SORT_ORDER_DEFAULT) {
    const updatedParams = toURLSearchParams(
      setSortBy(searchParams, field, order)
    );
    router.push(`${pathname}?${updatedParams}`);
    window.scroll(0, 0);
  }

  function onClickChangeLayoutType(layout: string) {
    const updatedParams = toURLSearchParams(
      setLayoutType(searchParams, layout)
    );
    router.push(`${pathname}?${updatedParams}`);
  }

  function onClickChangeCardType(card: string) {
    const updatedParams = toURLSearchParams(setCardType(searchParams, card));
    router.push(`${pathname}?${updatedParams}`);
  }

  function sortDropdownMenuItem(fieldName: string, order: SortOrder) {
    const label = dict[`search.sort.${fieldName}.${order}`];
    let mySortField = searchParams.sortField;
    let mySortOrder = searchParams.sortOrder;

    return (
      <DropdownMenuItem
        onClick={() => sortBy(fieldName, order)}
        disabled={mySortField === fieldName && mySortOrder === order}
      >
        {order === SORT_ORDER_ASC ? (
          <Icons.arrowDown className="mr-2 h-5 w-5" />
        ) : (
          <Icons.arrowUp className="mr-2 h-5 w-5" />
        )}
        <span>{label}</span>
        {fieldName === mySortField && mySortOrder === order && (
          <Icons.check className="ml-2 h-5 w-5" />
        )}
      </DropdownMenuItem>
    );
  }

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
                      <Icons.layoutGrid className="h-5 w-5" />
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
                      <Icons.layoutList className="h-5 w-5" />
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
                    <Icons.arrowUpDown className="h-5 w-5" />
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
                          <Icons.paintbrush2 className="h-5 w-5" />
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
                          <Icons.palette className="h-5 w-5" />
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
                          <Icons.pipette className="h-5 w-5" />
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
          disabled={searchParams.pageNumber <= 1}
          onClick={() => pageClick(searchParams.pageNumber - 1)}
          variant="ghost"
          size="sm"
          aria-label={dict['search.previous']}
        >
          <Icons.chevronLeft className="mr-2 h-5 w-5" aria-hidden="true" />
          <span className="">{dict['search.previous']}</span>
        </Button>
        <Button
          disabled={searchParams.pageNumber >= totalPages}
          onClick={() => pageClick(searchParams.pageNumber + 1)}
          variant="ghost"
          size="sm"
          aria-label={dict['search.next']}
        >
          <span className="">{dict['search.next']}</span>
          <Icons.chevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
