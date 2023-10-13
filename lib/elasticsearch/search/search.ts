import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';

import type { AggOptions } from '@/types/aggOptions';
import type {
  ApiResponseSearch,
  ApiResponseSearchMetadata,
} from '@/types/apiResponseSearch';
import type { Term } from '@/types/term';
import { indicesMeta } from '@/lib/elasticsearch/indicesMeta';
import { getClient } from '../client';
import { getElasticsearchIndices, type SearchParams } from './searchParams';
import {
  addColorQuery,
  addQueryAggs,
  addQueryBoolDateRange,
  addQueryBoolFilterTerms,
} from './searchQueryBuilder';
import { getTerm, terms } from './terms';

const DEFAULT_INDEX = 'all';
const MIN_SEARCH_QUERY_LENGTH = 3;

/**
 * Search for documents in one or more indices
 *
 * @param searchParams Search parameters
 * @returns Elasticsearch search response
 */
export async function search(
  searchParams: SearchParams
): Promise<ApiResponseSearch> {
  if (searchParams.index === 'art') {
    return searchCollections(searchParams);
  }
  const elasticsearchIndices = getElasticsearchIndices(searchParams);

  const esQuery: T.SearchRequest = {
    index: elasticsearchIndices,
    query: { bool: { must: {} } },
    from: (searchParams.pageNumber - 1) * searchParams.resultsPerPage || 0,
    size: searchParams.resultsPerPage,
    track_total_hits: true,
  };
  if (searchParams.query && esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        multi_match: {
          query: searchParams.query,
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

  if (searchParams.index === DEFAULT_INDEX) {
    esQuery.indices_boost = [{ news: 1.5 }, { events: 1.5 }, { art: 1 }];
  }

  addQueryBoolDateRange(esQuery, searchParams);
  addQueryBoolFilterTerms(esQuery, searchParams);
  addQueryAggs(esQuery, searchParams.index);

  if (searchParams.sortField && searchParams.sortOrder) {
    esQuery.sort = [
      { [searchParams.sortField]: searchParams.sortOrder as T.SortOrder },
    ];
  } else {
    esQuery.sort = [
      { sortPriority: 'desc' },
      { startYear: 'desc' },
      { date: 'desc' },
    ];
  }

  const client = getClient();

  const response: T.SearchTemplateResponse = await client.search(esQuery);

  const options = getResponseOptions(response);
  const metadata = getResponseMetadata(response, searchParams.resultsPerPage);
  const data = response.hits.hits.map((hit) => ({
    _id: hit._id,
    _index: hit._index,
    ...(hit._source || {}),
  }));
  const res: ApiResponseSearch = { query: esQuery, data, options, metadata };
  const qt = await getSearchQueryTerms(
    searchParams.query,
    searchParams.pageNumber,
    client
  );
  if (qt !== undefined && qt?.length > 0) res.terms = qt;
  return res;
}

export async function searchCollections(
  searchParams: SearchParams
): Promise<ApiResponseSearch> {
  const esQuery: T.SearchRequest = {
    index: searchParams.index,
    query: { bool: { must: {} } },
    from: (searchParams.pageNumber - 1) * searchParams.resultsPerPage || 0,
    size: searchParams.resultsPerPage,
    track_total_hits: true,
  };
  if (searchParams.query && esQuery?.query?.bool) {
    esQuery.query.bool.must = [
      {
        multi_match: {
          query: searchParams.query,
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

  if (searchParams.hexColor) {
    addColorQuery(esQuery, searchParams.hexColor);
  } else if (searchParams.sortField && searchParams.sortOrder) {
    esQuery.sort = [{ [searchParams.sortField]: searchParams.sortOrder }];
  } else {
    esQuery.sort = [{ sortPriority: 'desc' }, { startYear: 'desc' }];
  }

  addQueryBoolDateRange(esQuery, searchParams);
  addQueryBoolFilterTerms(esQuery, searchParams);
  addQueryAggs(esQuery, searchParams.index);

  const client = getClient();

  const response: T.SearchTemplateResponse = await client.search(esQuery);
  const options = getResponseOptions(response);
  const metadata = getResponseMetadata(response, searchParams.resultsPerPage);
  const data = response.hits.hits.map((hit) => ({
    _id: hit._id,
    _index: hit._index,
    ...(hit._source || {}),
  }));
  const res: ApiResponseSearch = { query: esQuery, data, options, metadata };
  const qt = await getSearchQueryTerms(
    searchParams.query,
    searchParams.pageNumber,
    client
  );
  if (qt !== undefined && qt?.length > 0) res.terms = qt;
  const term = await getFilterTerm(searchParams, client);
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
 * @param query Search query
 * @param pageNumber Page number
 * @param client ES client
 * @returns Array of matching terms
 */
async function getSearchQueryTerms(
  query: string | undefined,
  pageNumber: number,
  client: Client
): Promise<Term[] | undefined> {
  if (query && query?.length > MIN_SEARCH_QUERY_LENGTH && pageNumber === 1) {
    return await terms(query, undefined, client);
  }
}

async function getFilterTerm(
  searchParams: SearchParams,
  client: Client
): Promise<Term | undefined> {
  if (indicesMeta[searchParams.index]?.filters?.length > 0) {
    for (const filter of indicesMeta[searchParams.index].filters) {
      if (
        searchParams.aggFilters?.[filter] &&
        filter === 'primaryConstituent.canonicalName'
      ) {
        // TODO: Only returns primaryConstituent.canonicalName filter term
        // TODO: term fix naming conventions
        const response = await getTerm(
          'primaryConstituent.canonicalName',
          searchParams.aggFilters?.[filter],
          client
        );
        return response?.data as Term;
      }
    }
  }
}
