import { indicesMeta } from '@/util/elasticsearch/indicesMeta';
import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';
import convert from 'color-convert';

import type { AggOptions } from '@/types/aggOptions';
import type {
  ApiResponseSearch,
  ApiResponseSearchMetadata,
} from '@/types/apiResponseSearch';
import type { Term } from '@/types/term';
import { getClient } from '../client';
import { getTerm, terms } from './terms';

const DEFAULT_SEARCH_PAGE_SIZE = 24; // 24 results per page
const SEARCH_AGG_SIZE = 20; // 20 results per aggregation
const MIN_SEARCH_QUERY_LENGTH = 3; // Minimum length of search query

/**
 * Search for documents in one or more indices
 *
 * @param params Search parameters
 * @returns Elasticsearch search response
 */
export async function search(params: any): Promise<ApiResponseSearch> {
  if (params.index === 'art') {
    return searchCollections(params);
  }

  let { index, p, size, q, sf, so } = params;

  // Defaults for params:
  const searchIndices = index !== 'all' ? index : ['art', 'news', 'events'];
  size = size || DEFAULT_SEARCH_PAGE_SIZE;
  p = p || 1;

  const esQuery: T.SearchRequest = {
    index: searchIndices,
    query: { bool: { must: {} } },
    from: (p - 1) * size || 0,
    size,
    track_total_hits: true,
  };
  if (q && esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        multi_match: {
          query: q,
          type: 'cross_fields',
          operator: 'and',
          fields: [
            'boostedKeywords^20',
            'primaryConstituent.canonicalName.search^4',
            'title.search^2',
            'keywords^2',
            'description',
            'searchText',
          ],
        },
      },
    ];
  } else if (esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        match_all: {},
      },
    ];
  }

  if (index === 'all') {
    esQuery.indices_boost = [
      { news: 1.5 },
      { events: 1.5 },
      { art: 1 },
    ];
  }

  addQueryBoolDateRange(esQuery, params);
  addQueryBoolFilterTerms(esQuery, index, params);
  addQueryAggs(esQuery, index);

  if (sf && so) {
    esQuery.sort = [{ [sf]: so }];
  } else {
    esQuery.sort = [{ sortPriority: 'desc' }, { startYear: 'desc' }, { date: 'desc' } ];
  }

  const client = getClient();

  const response: T.SearchTemplateResponse = await client.search(esQuery);

  const options = getResponseOptions(response);
  const metadata = getResponseMetadata(response, size);
  const data = response.hits.hits.map(hit => ({
    _id: hit._id,
    _index: hit._index,
    ...(hit._source || {}),
  }));
  const res: ApiResponseSearch = { query: esQuery, data, options, metadata };
  const qt = await getSearchQueryTerms(q, p, client);
  if (qt !== undefined && qt?.length > 0) res.terms = qt;
  return res;
}

export async function searchCollections(
  params: any
): Promise<ApiResponseSearch> {
  let { p, size, q, color, sf, so } = params;

  // Defaults for missing params:
  const index = 'art';
  size = size || DEFAULT_SEARCH_PAGE_SIZE;
  p = p || 1;

  const esQuery: T.SearchRequest = {
    index,
    query: { bool: { must: {} } },
    from: (p - 1) * size || 0,
    size,
    track_total_hits: true,
  };
  if (q && esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        multi_match: {
          query: q,
          type: 'cross_fields',
          operator: 'and',
          fields: [
            'boostedKeywords^20',
            'primaryConstituent.canonicalName.search^6',
            'title.search^4',
            'keywords^4',
            'description',
            'searchText',
            'accessionNumber',
            'constituents.name.search',
            'exhibitions.search',
            'medium.search',
          ],
        },
      },
    ];
  } else if (esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        match_all: {},
      },
    ];
  }

  if (color) {
    addColorQuery(esQuery, color);
  } else if (sf && so) {
    esQuery.sort = [{ [sf]: so }];
  } else {
    esQuery.sort = [{ sortPriority: 'desc' }, { startYear: 'desc' }];
  }

  addQueryBoolDateRange(esQuery, params);
  addQueryBoolFilterTerms(esQuery, index, params);
  addQueryAggs(esQuery, index);

  const client = getClient();

  const response: T.SearchTemplateResponse = await client.search(esQuery);
  const options = getResponseOptions(response);
  const metadata = getResponseMetadata(response, size);
  const data = response.hits.hits.map(hit => ({
    _id: hit._id,
    _index: hit._index,
    ...(hit._source || {}),
  }));
  const res: ApiResponseSearch = { query: esQuery, data, options, metadata };
  const qt = await getSearchQueryTerms(q, p, client);
  if (qt !== undefined && qt?.length > 0) res.terms = qt;
  const term = await getFilterTerm(index, params, client);
  if (term !== undefined) res.filters = [term];
  return res;
}

/**
 * Get the options/buckets for each agg in the response
 *
 * @param response The response from the ES search
 * @returns Array of aggregations with options/buckets
 */
function getResponseOptions(response: T.SearchTemplateResponse): AggOptions {
  const options: AggOptions = {};
  if (response?.aggregations) {
    Object.keys(response?.aggregations).forEach((field) => {
      if (response.aggregations?.[field] !== undefined) {
        const aggAgg: T.AggregationsAggregate = response.aggregations?.[field];
        if ('buckets' in aggAgg && aggAgg?.buckets)
          options[field] = aggAgg.buckets;
      }
    });
  }
  return options;
}

/**
 * Get the total number of results and the number of pages
 *
 * @param response The response from the ES search
 * @param size The number of results per page
 * @returns Object with the total number of results and the number of pages
 */
function getResponseMetadata(
  response: T.SearchTemplateResponse,
  size: number
): ApiResponseSearchMetadata {
  let count = response?.hits?.total || 0; // Returns either number or SearchTotalHits
  if (typeof count !== 'number') count = count.value;
  return {
    count,
    pages: Math.ceil(count / size),
  };
}

/**
 * If there was a search query, search for matching terms:
 *
 * @param q Search query
 * @param p Page number
 * @param client ES client
 * @returns Array of matching terms
 */
async function getSearchQueryTerms(
  q: string,
  p: number,
  client: Client
): Promise<Term[] | undefined> {
  if (q?.length && q?.length > MIN_SEARCH_QUERY_LENGTH && p === 1) {
    return await terms(q, undefined, client);
  }
}

async function getFilterTerm(
  indexName: string,
  params: any,
  client: Client
): Promise<Term | undefined> {
  if (Array.isArray(indexName)) return; // TODO: Remove when we implement cross-index filters
  if (indicesMeta[indexName]?.filters?.length > 0) {
    for (const filter of indicesMeta[indexName].filters) {
      if (params?.[filter] && filter === 'primaryConstituent.canonicalName') {
        // TODO: Only returns primaryConstituent.canonicalName filter term
        // TODO: term fix naming conventions
        const response = await getTerm(
          'primaryConstituent.canonicalName',
          params?.[filter],
          client
        );
        return response?.data as Term;
      }
    }
  }
}

/**
 * Currently only supports year ranges
 *
 * @param esQuery The ES query to modify in place
 * @param params The search params
 */
function addQueryBoolDateRange(esQuery: any, params: any) {
  const ranges: T.QueryDslQueryContainer[] = [];
  if (params?.startYear !== undefined && params?.endYear !== undefined) {
    ranges.push({
      range: {
        startYear: {
          gte: params.startYear,
          lte: params.endYear,
        },
      },
    });
    ranges.push({
      range: {
        endYear: {
          gte: params.startYear,
          lte: params.endYear,
        },
      },
    });
  } else if (params?.startYear !== undefined) {
    ranges.push({
      range: {
        startYear: {
          gte: params.startYear,
        },
      },
    });
  } else if (params?.endYear !== undefined) {
    ranges.push({
      range: {
        endYear: {
          lte: params.endYear,
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

function addQueryBoolFilterTerms(esQuery: any, indexName: any, params: any) {
  if (Array.isArray(indexName)) return;
  if (indicesMeta[indexName]?.filters?.length > 0) {
    for (const filter of indicesMeta[indexName].filters) {
      if (filter === 'onView' && params?.[filter] === 'true')
        addQueryBoolFilterTerm(esQuery, 'onView', true);
      else if (filter === 'hasPhoto' && params?.[filter] === 'true')
        addQueryBoolFilterExists(esQuery, 'image.url');
      else if (filter === 'isUnrestricted' && params?.[filter] === 'true')
        addQueryBoolFilterTerm(esQuery, 'copyrightRestricted', false);
      else addQueryBoolFilterTerm(esQuery, filter, params?.[filter]);
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
function addQueryBoolFilterTerm(
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

function addQueryBoolFilter(esQuery: any, filter: any): void {
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
function addQueryBoolFilterExists(esQuery: any, name: string): void {
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
function addQueryBoolMustNotFilter(
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

function addQueryAggs(esQuery: any, indexName: string | string[] | undefined) {
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

function addColorQuery(esQuery: any, hexColor: string) {
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

export async function searchAll(
  index: string,
  query?: T.QueryDslQueryContainer,
  sourceFilter?: any
): Promise<any[]> {
  const client = getClient();

  const results: any[] = [];
  const responseQueue: any[] = [];
  const esQuery: T.SearchRequest = {
    index,
    scroll: '30s',
    size: 10000,
  };
  if (query) {
    esQuery.query = query;
  } else {
    esQuery.query = {
      match_all: {},
    };
  }
  if (sourceFilter) {
    esQuery._source = sourceFilter;
  }
  const response = await client.search(esQuery);
  responseQueue.push(response);

  while (responseQueue.length) {
    const body = responseQueue.shift();
    results.push(...body.hits.hits);
    if (body.hits.total.value === results.length) {
      break;
    }
    responseQueue.push(
      await client.scroll({
        scroll_id: body._scroll_id,
        scroll: '30s',
      })
    );
  }
  return results;
}
