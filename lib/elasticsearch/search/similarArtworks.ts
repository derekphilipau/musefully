import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';

import type { ArtworkDocument } from '@/types/document';
import { getClient } from '../client';
import { getDocument } from './document';

const SIMILAR_PAGE_SIZE = 24; // 24 results per similar search
const UNKNOWN_CONSTITUENT = 'Unknown'; // Default string for unknown constituent in dataset

export async function similarArtworksById(
  id: string,
  hasPhoto: boolean = true,
): Promise<ArtworkDocument[]> {
  if (!id) return [];
  const docResponse = await getDocument('art', id, false);
  const document = docResponse?.data as ArtworkDocument;
  if (document) return similarArtworks(document, hasPhoto);
  return [];
}

/**
 * Get similar objects for a given document
 *
 * @param document The document to get similar objects for
 * @param client The ES client
 * @returns Array of similar objects
 */
export async function similarArtworks(
  document?: ArtworkDocument,
  hasPhoto: boolean = true,
  client?: Client
): Promise<ArtworkDocument[]> {
  if (!document || !document.id) return [];

  const esQuery: T.SearchRequest = {
    index: 'art',
    query: {
      bool: {
        must_not: [
          {
            ids: {
              values: [document._id || ''],
            },
          },
        ],
      },
    },
    from: 0,
    size: SIMILAR_PAGE_SIZE,
  };

  if (hasPhoto && esQuery.query?.bool) {
    esQuery.query.bool.must = {
      exists: {
        field: 'image',
      },
    };
  }

  // Adjust these boosts to accomodate your conception of artwork similarity:
  if (
    document.primaryConstituent?.id &&
    document.primaryConstituent?.canonicalName !== UNKNOWN_CONSTITUENT
  ) {
    addShouldTerms(document, esQuery, 'primaryConstituent.canonicalName', 4);
  }
  addShouldTerms(document, esQuery, 'classification', 2);
  addShouldTerms(document, esQuery, 'dynasty', 1);
  addShouldTerms(document, esQuery, 'medium', 1);
  addShouldTerms(document, esQuery, 'period', 1);
  addShouldTerms(document, esQuery, 'departments', 1);
  addShouldTerms(document, esQuery, 'primaryGeographicalLocation.name', 1);

  if (!client) client = getClient();

  const response: T.SearchTemplateResponse = await client.search(esQuery);
  if (!response?.hits?.hits?.length) {
    return [];
  }
  return response.hits.hits.map(
    (hit) =>
      ({
        _id: hit._id,
        _index: hit._index,
        ...(hit._source || {}),
      } as ArtworkDocument)
  );
}

/**
 * Add a should term with boost to query
 *
 * @param document The document from which to get the value
 * @param esQuery The ES query
 * @param name  The name of the field to add to the term query
 * @returns  Void.  The ES Query is modified in place
 */
function addShouldTerms(
  document: ArtworkDocument,
  esQuery: T.SearchRequest,
  name: string,
  boost: number
) {
  if (!name) return;
  // only handle max two levels deep:
  const nameParts = name.split('.');
  let value: string | string[] = '';
  if (nameParts?.length === 2) {
    value = document?.[nameParts[0]]?.[nameParts[1]];
  } else {
    value = document[name];
  }
  if (!value) return;
  if (!Array.isArray(value)) value = [value];
  const queryFilter: T.QueryDslQueryContainer = {
    terms: {
      [name]: value,
      boost,
    },
  };
  esQuery.query = esQuery?.query || {};
  esQuery.query.bool = esQuery.query?.bool || {};
  esQuery.query.bool.should =
    esQuery.query.bool?.should || ([] as T.QueryDslQueryContainer[]);
  (esQuery.query.bool.should as T.QueryDslQueryContainer[]).push(queryFilter);
}
