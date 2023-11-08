import * as T from '@elastic/elasticsearch/lib/api/types';

import type { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { BaseDocument } from '@/types/document';
import { getClient } from '../client';
import { similarArtworks } from './similarArtworks';

/**
 * Get a document by Elasticsearch id
 *
 * If we're querying the art index, also return similar objects and similar dominant colors
 *
 * @param index Index to search
 * @param id ID of document to search for
 * @returns ApiResponseDocument containing query, data, similar objects and similar dominant colors
 */
export async function getDocument(
  index: string,
  id: string,
  getAdditionalData: boolean = true
): Promise<ApiResponseDocument> {
  const client = getClient();
  const document = await client.get({
    index,
    id: id + '' // force to string. this is actually the _id field
  });
  const data = {
    _id: document._id,
    _index: document._index,
    ...(document._source || {}),
  } as BaseDocument;

  const apiResponse: ApiResponseDocument = { data };
  if (index === 'art' && getAdditionalData) {
    apiResponse.similar = await similarArtworks(data, true, client);
  }
  return apiResponse;
}
