import {
  DEFAULT_INDEX,
  DEFAULT_SEARCH_PAGE_SIZE,
  GenericSearchParams,
  getSanitizedSearchParams,
  isHexColor,
  LAYOUT_DEFAULT,
  MAX_PAGES,
  SearchParams,
} from '@/lib/elasticsearch/search/searchParams';

describe('getSanitizedSearchParams', () => {
  const validIndex = 'art';
  const invalidIndex = 'invalid';
  const genericSearchParams: GenericSearchParams = {
    p: '2',
    size: '30',
    q: 'test',
    sf: 'startYear',
    so: 'asc',
    color: 'facc15',
    isUnrestricted: 'true',
    hasPhoto: 'true',
    onView: 'true',
    layout: 'list',
    card: 'cardType',
    f: 'true',
    startYear: '1990',
    endYear: '2020',
    invalidFilter: 'value',
  };

  it('should use the provided index when valid', () => {
    const sanitizedParams = getSanitizedSearchParams(validIndex, {});
    expect(sanitizedParams.index).toBe(validIndex);
  });

  it('should fall back to the default index when an invalid index is provided', () => {
    const sanitizedParams = getSanitizedSearchParams(invalidIndex, {});
    expect(sanitizedParams.index).toBe(DEFAULT_INDEX);
  });

  it('should sanitize and set all provided parameters correctly', () => {
    const sanitizedParams = getSanitizedSearchParams(
      validIndex,
      genericSearchParams
    ) as SearchParams;
    expect(sanitizedParams.pageNumber).toBe(
      parseInt(genericSearchParams.p as string)
    );
    expect(sanitizedParams.resultsPerPage).toBe(
      parseInt(genericSearchParams.size as string)
    );
    expect(sanitizedParams.query).toBe(genericSearchParams.q);
    expect(sanitizedParams.sortField).toBe(genericSearchParams.sf);
    expect(sanitizedParams.sortOrder).toBe(genericSearchParams.so);
    expect(sanitizedParams.hexColor).toBe(genericSearchParams.color);
    expect(sanitizedParams.isUnrestricted).toBe(true);
    expect(sanitizedParams.hasPhoto).toBe(true);
    expect(sanitizedParams.onView).toBe(true);
    expect(sanitizedParams.layout).toBe(genericSearchParams.layout);
    expect(sanitizedParams.cardType).toBe(genericSearchParams.card);
    expect(sanitizedParams.isShowFilters).toBe(true);
    expect(sanitizedParams.startYear).toBe(
      parseInt(genericSearchParams.startYear as string)
    );
    expect(sanitizedParams.endYear).toBe(
      parseInt(genericSearchParams.endYear as string)
    );
    expect(sanitizedParams.aggFilters).toEqual({});
  });

  it('should set default values for missing parameters', () => {
    const sanitizedParams = getSanitizedSearchParams(
      validIndex,
      {}
    ) as SearchParams;
    expect(sanitizedParams.pageNumber).toBe(1);
    expect(sanitizedParams.resultsPerPage).toBe(DEFAULT_SEARCH_PAGE_SIZE);
    expect(sanitizedParams.query).toBe('');
    expect(sanitizedParams.layout).toBe(LAYOUT_DEFAULT);
  });

  it('should clamp the page number to be within 1 and MAX_PAGES', () => {
    const belowRangeParams = getSanitizedSearchParams(validIndex, {
      p: '-5',
    }) as SearchParams;
    expect(belowRangeParams.pageNumber).toBe(1);

    const withinRangeParams = getSanitizedSearchParams(validIndex, {
      p: (MAX_PAGES - 1).toString(),
    }) as SearchParams;
    expect(withinRangeParams.pageNumber).toBe(MAX_PAGES - 1);

    const aboveRangeParams = getSanitizedSearchParams(validIndex, {
      p: (MAX_PAGES + 100).toString(),
    }) as SearchParams;
    expect(aboveRangeParams.pageNumber).toBe(1);
  });

  it('should determine if hex color string is valid', () => {
    const t1 = 'facc15';
    expect(isHexColor(t1)).toBe(true);

    const t2 = '#facc15';
    expect(isHexColor(t2)).toBe(false);

    const t3 = 'facc15a';
    expect(isHexColor(t3)).toBe(false);

    const t4 = 'facc1';
    expect(isHexColor(t2)).toBe(false);
  });
});
