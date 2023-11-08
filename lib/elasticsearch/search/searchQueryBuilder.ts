import * as T from '@elastic/elasticsearch/lib/api/types';
import convert from 'color-convert';
import { format } from 'date-fns';

import { indicesMeta } from '@/lib/elasticsearch/indicesMeta';
import { type SearchParams } from './searchParams';

const SEARCH_AGG_SIZE = 20; // 20 results per aggregation

/**
 * Currently only supports year ranges
 *
 * @param esQuery The ES query to modify in place
 * @param searchParams The search params
 */
export function addQueryBoolDateRange(
  esQuery: any,
  searchParams: SearchParams
) {
  const ranges: T.QueryDslQueryContainer[] = [];
  if (
    searchParams.startYear !== undefined &&
    searchParams.endYear !== undefined
  ) {
    ranges.push({
      range: {
        startYear: {
          gte: searchParams.startYear,
          lte: searchParams.endYear,
        },
      },
    });
    ranges.push({
      range: {
        endYear: {
          gte: searchParams.startYear,
          lte: searchParams.endYear,
        },
      },
    });
  } else if (searchParams.startYear !== undefined) {
    ranges.push({
      range: {
        startYear: {
          gte: searchParams.startYear,
        },
      },
    });
  } else if (searchParams.endYear !== undefined) {
    ranges.push({
      range: {
        endYear: {
          lte: searchParams.endYear,
        },
      },
    });
  }
  if (ranges.length > 0) {
    esQuery.query ??= {};
    esQuery.query.bool ??= {};
    esQuery.query.bool.filter ??= [];
    esQuery.query.bool.filter.push(...ranges);
  }
}

export function addQueryBoolFilterTerms(
  esQuery: any,
  searchParams: SearchParams
) {
  if (indicesMeta[searchParams.index]?.filters?.length > 0) {
    for (const filter of indicesMeta[searchParams.index].filters) {
      switch (filter) {
        case 'onView':
          if (searchParams.onView) {
            addQueryBoolFilterTerm(esQuery, 'onView', true);
          }
          break;
        case 'hasPhoto':
          if (searchParams.hasPhoto) {
            addQueryBoolFilterExists(esQuery, 'image.url');
          }
          break;
        case 'isUnrestricted':
          if (searchParams.isUnrestricted) {
            addQueryBoolFilterTerm(esQuery, 'copyrightRestricted', true);
          }
          break;
        default:
          if (searchParams?.aggFilters[filter]) {
            addQueryBoolFilterTerm(
              esQuery,
              filter,
              searchParams?.aggFilters[filter]
            );
          }
      }
    }
  }
}

/**
 * Add a term to a bool filter query
 *
 * @param esQuery   The ES query
 * @param name    The name of the field to filter on
 * @param value   The value to filter on
 * @returns  Void.  The ES Query is modified in place
 */
export function addQueryBoolFilterTerm(
  esQuery: any,
  name: string,
  value: string | boolean | number | undefined
): void {
  if (!value) return;
  esQuery.query ??= {};
  esQuery.query.bool ??= {};
  esQuery.query.bool.filter ??= [];
  esQuery.query.bool.filter.push({
    term: {
      [name]: value,
    },
  });
}

export function addQueryBoolFilter(esQuery: any, filter: any): void {
  if (!filter) return;
  esQuery.query ??= {};
  esQuery.query.bool ??= {};
  esQuery.query.bool.filter ??= [];
  esQuery.query.bool.filter.push(filter);
}

/**
 * Add an exists clause to a bool filter query
 *
 * @param esQuery   The ES query
 * @param name    The name of the field to filter on
 * @returns  Void.  The ES Query is modified in place
 */
export function addQueryBoolFilterExists(esQuery: any, name: string): void {
  esQuery.query ??= {};
  esQuery.query.bool ??= {};
  esQuery.query.bool.filter ??= [];
  esQuery.query.bool.filter.push({
    exists: {
      field: name,
    },
  });
}

/**
 * Add a term to a bool must not section of query
 *
 * @param esQuery The ES query
 * @param name  The name of the field that must exist
 * @returns  Void.  The ES Query is modified in place
 */
export function addQueryBoolMustNotFilter(
  esQuery: any,
  name: string,
  value: string | boolean | number | undefined
): void {
  if (!value) return;
  esQuery.query ??= {};
  esQuery.query.bool ??= {};
  esQuery.query.bool.must_not ??= [];
  esQuery.query.bool.must_not.push({
    term: {
      [name]: value,
    },
  });
}

export function addQueryAggs(
  esQuery: any,
  indexName: string | string[] | undefined
) {
  if (indexName === undefined || Array.isArray(indexName)) return;
  if (indicesMeta[indexName]?.aggs?.length > 0) {
    const aggs = {};
    for (const aggName of indicesMeta[indexName].aggs) {
      aggs[aggName] = {
        terms: {
          field: aggName,
          size: SEARCH_AGG_SIZE,
        },
      };
    }
    esQuery.aggs = aggs;
  }
}

export function addColorQuery(esQuery: any, hexColor: string) {
  if (!hexColor) return;

  const color = convert.hex.lab(hexColor);

  if (!color || color.length !== 3) return;

  const colorQuery: T.QueryDslQueryContainer = {
    function_score: {
      query: {
        nested: {
          path: 'image.dominantColors',
          query: {
            function_score: {
              score_mode: 'multiply',
              functions: [
                {
                  exp: {
                    'image.dominantColors.l': {
                      origin: color[0],
                      offset: 10,
                      scale: 20,
                    },
                  },
                },
                {
                  exp: {
                    'image.dominantColors.a': {
                      origin: color[1],
                      offset: 5,
                      scale: 10,
                    },
                  },
                },
                {
                  exp: {
                    'image.dominantColors.b': {
                      origin: color[2],
                      offset: 5,
                      scale: 10,
                    },
                  },
                },
                {
                  field_value_factor: {
                    field: 'image.dominantColors.percent',
                    modifier: 'log1p',
                    factor: 5,
                  },
                },
              ],
            },
          },
          score_mode: 'sum',
        },
      },
      functions: [
        {
          script_score: {
            script: '_score',
          },
        },
      ],
    },
  };

  if (!esQuery.query?.bool?.must && esQuery?.query?.bool) {
    esQuery.query.bool.must = [];
  }

  if (colorQuery) {
    if (!esQuery.query?.bool?.must && esQuery?.query?.bool) {
      esQuery.query.bool.must = [];
    }
    if (Array.isArray(esQuery?.query?.bool?.must)) {
      esQuery.query?.bool?.must.push(colorQuery);
    }
    esQuery.sort = ['_score'];
  }
}
