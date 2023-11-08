import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';

import { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { TermDocument } from '@/types/document';
import { getClient } from '../client';

const TERMS_PAGE_SIZE = 12; // 12 results per aggregation terms search

/**
 * Get term by field and value
 *
 * @param field Field name
 * @param value Field value
 * @param client Elasticsearch client
 * @returns ApiResponseDocument containing TermDocument
 */
export async function getTerm(
  field: string,
  value: string,
  client?: Client
): Promise<ApiResponseDocument | undefined> {
  if (!field || !value) return;
  const request: T.SearchRequest = {
    index: 'terms',
    query: {
      bool: {
        must: [{ match: { field } }, { match: { value } }],
      },
    },
  };

  if (!client) client = getClient();

  try {
    const response: T.SearchTemplateResponse = await client.search(request);
    const data = response?.hits?.hits[0]?._source as TermDocument;
    const apiResponse: ApiResponseDocument = { query: request, data };
    return apiResponse;
  } catch (e) {
    console.error(e);
  }
  return;
}

export async function terms(
  query?: string | string[] | null,
  size: number = TERMS_PAGE_SIZE,
  client?: Client
): Promise<TermDocument[]> {
  const myQuery = Array.isArray(query) ? query.join(' ') : query;
  if (!myQuery || myQuery === undefined) return [];
  const request: T.SearchRequest = {
    index: 'terms',
    query: {
      multi_match: {
        query: myQuery,
        fields: ['value^3', 'alternates'],
        fuzziness: 'AUTO:3,7',
      },
    },
    from: 0,
    size,
  };

  if (!client) client = getClient();

  try {
    const response: T.SearchTemplateResponse = await client.search(request);
    return response.hits.hits.map((h) => h._source as TermDocument);
  } catch (e) {
    console.error(e);
  }
  return [];
}
