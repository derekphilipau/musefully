import * as T from '@elastic/elasticsearch/lib/api/types';

import type { ApiResponseSuggest } from '@/types/apiResponseSearch';
import { TermDocument } from '@/types/document';
import { getClient } from '../client';

const MAX_SUGGESTIONS = 10; // Maximum number of suggestions to return

/**
 * Use Elasticsearch search-as-you-type to search terms:
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/search-as-you-type.html
 *
 * @param params contains 'q' string representing query
 * @returns ApiResponseSuggest object containing query and data
 */
export async function suggest(q?: string | null): Promise<ApiResponseSuggest> {
  if (!q) return {};
  const client = getClient();

  const esQuery: T.SearchRequest = {
    index: 'terms',
    query: {
      multi_match: {
        query: q,
        type: 'bool_prefix',
        fields: [
          'value.suggest',
          'value.suggest._2gram',
          'value.suggest._3gram',
        ],
      },
    },
    _source: ['field', 'value', 'index'], // Just return the value
    size: MAX_SUGGESTIONS,
  };

  const response: T.SearchTemplateResponse = await client.search(esQuery);
  const data = response.hits.hits.map((h) => h._source as TermDocument);
  const res: ApiResponseSuggest = { query: esQuery, data };
  return res;
}
