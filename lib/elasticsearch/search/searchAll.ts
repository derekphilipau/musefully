import * as T from '@elastic/elasticsearch/lib/api/types';

import { getClient } from '../client';

/**
 * Searches all documents in a given Elasticsearch index that match the specified query.
 * Used for ingest and updating.
 *
 * @param {string} index - index to search within.
 * @param {T.QueryDslQueryContainer} [query] - Elasticsearch query to apply. If none is provided, default to matching all documents.
 * @param {any} [sourceFilter] - Optional, select which fields from the documents should be returned.
 * @returns {Promise<any[]>} - A promise that resolves to an array of the matching documents.
 */
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
