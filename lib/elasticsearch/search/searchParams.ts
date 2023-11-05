/**
 * Encapsulates & validates search parameters.
 */
import { SortOrder as ElasticsearchSortOrder } from '@elastic/elasticsearch/lib/api/types';

import { getBooleanValue } from '@/lib/various';
import { indicesMeta } from '../indicesMeta';

export type SortOrder = ElasticsearchSortOrder;
export const SORT_ORDER_ASC: SortOrder = 'asc';
export const SORT_ORDER_DESC: SortOrder = 'desc';
export const SORT_ORDER_DEFAULT = SORT_ORDER_ASC;
export const SORT_ORDERS = [SORT_ORDER_ASC, SORT_ORDER_DESC];

export type LayoutType = 'grid' | 'list';
export const LAYOUT_GRID: LayoutType = 'grid';
export const LAYOUT_LIST: LayoutType = 'list';
export const LAYOUT_DEFAULT = LAYOUT_GRID;
export const LAYOUTS = [LAYOUT_GRID, LAYOUT_LIST];

export type CardType = 'swatch' | 'palette' | 'color';
export const CARD_SWATCH: CardType = 'swatch';
export const CARD_PALETTE: CardType = 'palette';
export const CARD_COLOR: CardType = 'color';
export const CARD_DEFAULT = CARD_SWATCH;
export const CARDS = [CARD_SWATCH, CARD_PALETTE, CARD_COLOR];

export const ALL_INDICES = ['art', 'news', 'events'];
export const DEFAULT_INDEX = 'all';
export const DEFAULT_SEARCH_PAGE_SIZE = 24;
export const MAX_SEARCH_PAGE_SIZE = 100;
export const MAX_PAGES = 1000; // Don't allow more than 1000 pages of results
export const SORT_FIELDS = [
  'title',
  'startYear',
  'primaryConstituent.canonicalName',
];

export interface SearchParams {
  index: string; // index or indices to search
  pageNumber: number; // page number
  resultsPerPage: number; // number of results per page
  query?: string; // search query
  sortField?: string; // sort field
  sortOrder?: SortOrder; // sort order (asc or desc)
  hexColor?: string; // hex color
  isUnrestricted: boolean; // is copyright unrestricted?
  hasPhoto: boolean; // does it have a photo?
  onView: boolean; // is it on view?
  layout: LayoutType; // layout type
  cardType?: string; // card type
  isShowFilters: boolean; // show filters?
  aggFilters: Record<string, string>; // aggregation filters
  startYear?: number;
  endYear?: number;
}

// Type: See: https://github.com/vercel/next.js/discussions/46131
export type GenericSearchParams = {
  [key: string]: string | string[] | undefined;
};

/**
 * Validate and transform raw search parameters.
 *
 * @param index - The index to search in.
 * @param params - Raw query string parameters.
 * @returns Validated and transformed search parameters.
 */
export function getSanitizedSearchParams(
  index: string,
  params: GenericSearchParams
): SearchParams {
  const sanitizedParams: Partial<SearchParams> = {};

  sanitizedParams.index =
    index && ALL_INDICES.includes(index) ? index : DEFAULT_INDEX;

  // page number between 1 and MAX_PAGES
  const pageNumber =
    typeof params.p === 'string' ? parseInt(params.p, 10) : undefined;
  sanitizedParams.pageNumber =
    pageNumber && pageNumber > 0 && pageNumber <= MAX_PAGES ? pageNumber : 1;

  // size (number of results shown per page)
  const size =
    typeof params.size === 'string' ? parseInt(params.size, 10) : undefined;
  sanitizedParams.resultsPerPage =
    size && size > 0 && size < MAX_SEARCH_PAGE_SIZE
      ? size
      : DEFAULT_SEARCH_PAGE_SIZE;

  // q (search query)
  sanitizedParams.query =
    typeof params.q === 'string' && params.q ? params.q : '';

  sanitizedParams.sortField = getSortField(params.sf); // sf (sort field)
  sanitizedParams.sortOrder = getSortOrder(params.so); // so (sort order)

  // color (hex w/o hash)
  sanitizedParams.hexColor =
    typeof params.color === 'string' && isHexColor(params.color)
      ? params.color
      : undefined;

  // various filters
  sanitizedParams.isUnrestricted = getBooleanValue(params.isUnrestricted);
  sanitizedParams.hasPhoto = getBooleanValue(params.hasPhoto);
  sanitizedParams.onView = getBooleanValue(params.onView);

  // ui layout
  sanitizedParams.layout =
    typeof params.layout === 'string' && params.layout === LAYOUT_LIST
      ? LAYOUT_LIST
      : LAYOUT_DEFAULT;
  sanitizedParams.cardType =
    (typeof params.card === 'string' && params.card) || undefined;
  sanitizedParams.isShowFilters = getBooleanValue(params.f);

  // date range
  sanitizedParams.startYear =
    typeof params.startYear === 'string' && params.startYear
      ? parseInt(params.startYear, 10)
      : undefined;
  sanitizedParams.endYear =
    typeof params.endYear === 'string' && params.endYear
      ? parseInt(params.endYear, 10)
      : undefined;

  sanitizedParams.aggFilters = {};
  if (
    params &&
    sanitizedParams.index &&
    Array.isArray(indicesMeta[sanitizedParams.index]?.aggs)
  ) {
    for (const aggName of indicesMeta[sanitizedParams.index].aggs) {
      if (typeof params[aggName] === 'string' && params[aggName]) {
        sanitizedParams.aggFilters[aggName] = params[aggName] as string;
      }
    }
  }

  return sanitizedParams as SearchParams;
}

/**
 * Determine the appropriate Elasticsearch indices to search in.
 * If index is 'all' or a value not in ALL_INDICES, return ALL_INDICES.
 *
 * @param searchParams - The search parameters.
 * @returns The indices to search in.
 */
export function getElasticsearchIndices(
  searchParams: SearchParams
): string | string[] {
  if (ALL_INDICES.includes(searchParams.index)) {
    return searchParams.index;
  }
  return ALL_INDICES;
}

/**
 * Transform a sort field parameter to a valid sort field.
 *
 * @param field - The raw sort field parameter.
 * @returns The valid sort field or undefined.
 */
function getSortField(
  field: string | string[] | undefined
): string | undefined {
  if (
    typeof field === 'string' &&
    field !== undefined &&
    SORT_FIELDS.includes(field)
  ) {
    return field;
  }
  return undefined;
}

/**
 * Transform a sort order parameter to a valid sort order.
 *
 * @param order - The raw sort order parameter.
 * @returns The valid sort order or undefined.
 */
function getSortOrder(
  order: string | string[] | undefined
): SortOrder | undefined {
  if (
    typeof order === 'string' &&
    order !== undefined &&
    SORT_ORDERS.includes(order as SortOrder)
  ) {
    return order as SortOrder;
  }
  return undefined;
}

/**
 * Convert search parameters to URL query parameters for client-side navigation.
 *
 * Only set parameters that differ from the default values.
 *
 * @param searchParams - The search parameters.
 * @returns The URLSearchParams object.
 */
export function toURLSearchParams(
  searchParams?: SearchParams
): URLSearchParams {
  const urlParams = new URLSearchParams();

  if (!searchParams) return urlParams;

  if (searchParams.pageNumber > 1)
    urlParams.set('p', searchParams.pageNumber.toString());
  if (searchParams.resultsPerPage !== DEFAULT_SEARCH_PAGE_SIZE)
    urlParams.set('size', searchParams.resultsPerPage.toString());

  if (searchParams.query) urlParams.set('q', searchParams.query);
  if (searchParams.sortField) urlParams.set('sf', searchParams.sortField);
  if (searchParams.sortOrder) urlParams.set('so', searchParams.sortOrder);
  if (searchParams.hexColor) urlParams.set('color', searchParams.hexColor);

  if (searchParams.isUnrestricted)
    urlParams.set('isUnrestricted', searchParams.isUnrestricted.toString());
  if (searchParams.hasPhoto)
    urlParams.set('hasPhoto', searchParams.hasPhoto.toString());
  if (searchParams.onView)
    urlParams.set('onView', searchParams.onView.toString());
  if (searchParams.isShowFilters === true) urlParams.set('f', 'true');

  if (searchParams.layout && searchParams.layout !== LAYOUT_DEFAULT)
    urlParams.set('layout', searchParams.layout);
  if (searchParams.cardType) urlParams.set('card', searchParams.cardType);

  if (searchParams.startYear)
    urlParams.set('startYear', searchParams.startYear.toString());
  if (searchParams.endYear)
    urlParams.set('endYear', searchParams.endYear.toString());

  // Setting aggFilters (assuming their values are strings or can be stringified)
  for (const key in searchParams.aggFilters) {
    const value = searchParams.aggFilters[key]?.toString();
    if (value) {
      urlParams.set(key, value);
    }
  }

  return urlParams;
}

/**
 * Immutable update of the search query in the search parameters.
 *
 * @param searchParams - The current search parameters.
 * @param pageNumber - The new page number.
 * @returns New search parameters.
 */
export function setPageNumber(
  searchParams: SearchParams,
  pageNumber: number
): SearchParams {
  const params = { ...searchParams };
  params.pageNumber = 1;
  if (pageNumber > 0 && pageNumber < MAX_PAGES) {
    params.pageNumber = pageNumber;
  }
  return params;
}

/**
 * Immutable update of the number of results per page in the search parameters.
 *
 * If results per page is invalid, default to DEFAULT_SEARCH_PAGE_SIZE.
 *
 * @param searchParams - The current search parameters.
 * @param resultsPerPage - The new number of results per page.
 * @returns New search parameters.
 */
export function setResultsPerPage(
  searchParams: SearchParams,
  resultsPerPage: string
): SearchParams {
  const params = { ...searchParams };
  const resultsPerPageInt = parseInt(resultsPerPage, 10);
  if (resultsPerPageInt > 0 && resultsPerPageInt <= MAX_SEARCH_PAGE_SIZE) {
    params.resultsPerPage = resultsPerPageInt;
  } else {
    params.resultsPerPage = DEFAULT_SEARCH_PAGE_SIZE;
  }
  params.pageNumber = 1;
  return params;
}

/**
 * Immutable update of the sort field and sort order in the search parameters.
 *
 * @param searchParams - The current search parameters.
 * @param sortField - The new sort field.
 * @param sortOrder - The new sort order.
 * @returns New search parameters.
 */
export function setSortBy(
  searchParams: SearchParams,
  sortField: string,
  sortOrder: SortOrder
): SearchParams {
  const params = { ...searchParams };
  if (sortField && sortOrder) {
    params.sortField = sortField;
    params.sortOrder = sortOrder;
  } else {
    params.sortField = undefined;
    params.sortOrder = undefined;
  }
  params.pageNumber = 1;
  return params;
}

/**
 * Immutable update of the search UI layout type.
 *
 * @param searchParams - The current search parameters.
 * @param layoutType - The new layout type.
 * @returns New search parameters.
 */
export function setLayoutType(
  searchParams: SearchParams,
  layout: string
): SearchParams {
  const params = { ...searchParams };
  params.layout = LAYOUT_DEFAULT;
  if (layout && LAYOUTS.includes(layout as LayoutType)) {
    params.layout = layout as LayoutType;
  }
  return params;
}

/**
 * Immutable update of the card type. (Expiremental only)
 *
 * @param searchParams - The current search parameters.
 * @param cardType - The new card type.
 * @returns New search parameters.
 */
export function setCardType(
  searchParams: SearchParams,
  cardType?: string
): SearchParams {
  const params = { ...searchParams };
  if (cardType && CARDS.includes(cardType as CardType)) {
    params.cardType = cardType as CardType;
  }
  return params;
}

/**
 * Immutable update of the color filter in search parameters.
 *
 * @param searchParams - The current search parameters.
 * @param hexColor - The new hex color (without the hash)
 * @returns New search parameters.
 */
export function setColor(
  searchParams: SearchParams,
  hexColor?: string
): SearchParams {
  const params = { ...searchParams };
  params.hexColor = hexColor ? hexColor : undefined;
  params.pageNumber = 1;
  return params;
}

/**
 * Immutable toggle the show filters flag in search parameters.
 *
 * @param searchParams - The current search parameters.
 * @returns New search parameters.
 */
export function toggleIsShowFilters(searchParams: SearchParams): SearchParams {
  const params = { ...searchParams };
  params.isShowFilters = !params.isShowFilters;
  return params;
}

/**
 * Immutable update of start & end years in search parameters.
 * Note that years can be negative to indicate B.C.E.
 *
 * @param params search params
 * @param startYear string representing year, can be negative
 * @param endYear string representing year, can be negative
 * @returns
 */
export function setYearRange(
  params: SearchParams,
  startYear?: number | null,
  endYear?: number | null
): SearchParams {
  const updatedParams = { ...params };
  updatedParams.startYear = startYear || undefined;
  updatedParams.endYear = endYear || undefined;
  updatedParams.pageNumber = 1;
  return updatedParams;
}

/**
 * Detect if a string is a valid hex color (without the hash).
 *
 * @param color - String to test
 * @returns True if the string is a valid hex color
 */
export function isHexColor(color: string): boolean {
  return /^[A-Fa-f0-9]{6}$/.test(color);
}
