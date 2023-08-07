import { Client } from '@elastic/elasticsearch';
import * as T from '@elastic/elasticsearch/lib/api/types';

import { collections, content, events, terms } from './indices';

const indices = {
  collections,
  content,
  events,
  terms,
};

/**
 * Sleep for a given number of seconds.
 *
 * @param s Number of seconds to sleep.
 * @returns A promise that resolves after the given number of seconds.
 */
export function snooze(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

/**
 * Check if a given index already exists in Elasticsearch.
 *
 * @param client Elasticsearch client.
 * @param indexName Name of the index.
 * @returns True if the index exists, false otherwise.
 */
async function existsIndex(
  client: Client,
  indexName: string
): Promise<boolean> {
  return (await client.indices.exists({ index: indexName })) ? true : false;
}

/**
 * Delete an Elasticsearch index.
 *
 * @param client Elasticsearch client.
 * @param indexName Name of the index.
 */
async function deleteIndex(client: Client, indexName: string) {
  if (await existsIndex(client, indexName)) {
    try {
      await client.indices.delete({ index: indexName });
    } catch (err) {
      console.error(`Error deleting index ${indexName}: ${err}`);
    }
  }
}

/**
 * Delete all documents from an index that have a given field or source.
 *
 * @param indexName name of the index
 * @param fieldName name of the field, e.g. 'title'
 * @param sourceName OR name of the source, e.g. 'MoMA'
 */
export async function deleteDocuments(
  client: Client,
  indexName: string,
  fieldName?: string,
  sourceName?: string
) {
  // delete all documents where field = fieldName or source = sourceName
  if (!fieldName && !sourceName)
    throw new Error('Must specify either fieldName or sourceName');
  if (await existsIndex(client, indexName)) {
    const deleteQuery = {
      index: indexName,
      body: {
        query: {
          match: {},
        },
      },
    };
    if (sourceName) {
      deleteQuery.body.query.match = { source: sourceName };
    } else {
      deleteQuery.body.query.match = { field: fieldName };
    }
    await client.deleteByQuery(deleteQuery);
  }
}

/**
 * Create an Elasticsearch index.
 *
 * @param client Elasticsearch client.
 * @param indexName Name of the index.
 * @param deleteIndexIfExists Delete the index if it already exists.
 * @param deleteAliasIfExists Delete the alias if it already exists.
 */
export async function createIndex(
  client: Client,
  indexName: string,
  deleteIndexIfExists = false,
  deleteAliasIfExists = true
) {
  if (!indices[indexName]) {
    throw new Error(`Index ${indexName} does not exist in indices definition`);
  }

  if (deleteAliasIfExists) {
    // Check if the index already exists as an alias
    const aliasExists = await client.indices.existsAlias({
      name: indexName,
    });
    if (aliasExists) {
      await deleteAliasIndices(client, indexName);
      console.log(`Deleted existing alias ${indexName}`);
    }
  } else if (deleteIndexIfExists) {
    await deleteIndex(client, indexName);
  }

  const indexExists = await existsIndex(client, indexName);
  if (!indexExists) {
    await client.indices.create({
      index: indexName,
      body: indices[indexName],
    });
  }
}

export async function createIndexIfNotExist(
  client: Client,
  indexName: string,
) {
  return createIndex(client, indexName, false, true);
}

export async function forceCreateIndexIfNotExist(
  client: Client,
  indexName: string,
) {
  return createIndex(client, indexName, true, true);
}

async function createIndexIfNotExists(client: Client, indexName: string) {
  // Check if the index already exists as an alias
  const aliasExists = await client.indices.existsAlias({
    name: indexName,
  });
  if (aliasExists) {
    await deleteAliasIndices(client, indexName);
    console.log(`Deleted existing alias ${indexName}`);
  }
  await createIndex(client, indexName, false); // Create index if doesn't exist
}

/**
 * Generates a timestamped index name.
 *
 * This function takes an index name as a string, generates a timestamp,
 * and then appends this timestamp to the original index name. The timestamp
 * is derived from the current date and time, and is formatted to remove any
 * characters that might not be suitable in an index name.
 *
 * @param indexName The original index name.
 * @returns The original index name appended with a timestamp.
 */
export function getTimestampedIndexName(indexName: string): string {
  // Generate an ISO string for the current date and time.
  const timestamp = new Date().toISOString();

  // Format the timestamp to remove 'T', ':', and any characters after (and including) the '.'
  const formattedTimestamp = timestamp
    .replace('T', '_') // Replace 'T' with '_'
    .replaceAll(':', '') // Remove ':'
    .replace(/\..+?Z/, ''); // Remove any characters after and including the '.'

  // Append the formatted timestamp to the original index name and return.
  return `${indexName}_${formattedTimestamp}`;
}

/**
 * Create an Elasticsearch index.
 *
 * @param client Elasticsearch client.
 * @param indexName Name of the index.
 */
export async function createTimestampedIndex(
  client: Client,
  indexName: string
) {
  const timestampedIndexName = getTimestampedIndexName(indexName);

  if (!indices[indexName]) {
    throw new Error(`Index ${indexName} does not exist in indices definition`);
  }
  await client.indices.create({
    index: timestampedIndexName,
    body: indices[indexName],
  });
  return timestampedIndexName;
}

/**
 * Associate a timestamped index with an alias.  If the alias already exists,
 * it will be removed from any other indices and associated with the new index.
 * Any old indices will be deleted.
 *
 * @param client Elasticsearch client.
 * @param aliasName Name of the alias.
 * @param newIndexName Name of the new timestamped index.
 */
export async function setIndexAsAlias(
  client: Client,
  aliasName: string,
  newIndexName: string
) {
  // Get status of OpenSearch:
  const statusResponse: T.IndicesStatsResponse = await client.indices.stats();

  // Check if the alias already exists
  const aliasExists = await client.indices.existsAlias({
    name: aliasName,
  });
  if (!aliasExists) {
    // Alias does not exist
    // If an index already exists with the alias name, delete it
    await deleteIndex(client, aliasName);
  } else {
    // Alias already exists
    const aliasResponse: T.IndicesGetAliasResponse =
      await client.indices.getAlias({
        name: aliasName,
      });
    if (aliasResponse) {
      // Response is an object with keys that are the real index names,
      // and values that are objects with keys that are the alias names:
      // { 'content_2023-06-17_031903': { aliases: { content: {} } } }
      for (const oldIndexName of Object.keys(aliasResponse)) {
        // Remove the old aliases
        await client.indices.deleteAlias({
          name: aliasName,
          index: oldIndexName,
        });
      }
    }
  }

  // Switch alias to new index
  await client.indices.putAlias({
    name: aliasName,
    index: newIndexName,
  });

  // Now, remove all old timestamped indices
  if (statusResponse.indices && typeof statusResponse.indices === 'object') {
    for (const timestampedIndexName of Object.keys(statusResponse.indices)) {
      if (
        aliasName === timestampedIndexName.split('_', 1)[0] &&
        timestampedIndexName !== newIndexName
      ) {
        await deleteIndex(client, timestampedIndexName);
      }
    }
  }
}

/**
 * Completely remove an alias an all current and past indices associated with it.
 *
 * @param client Elasticsearch client.
 * @param aliasName Name of the alias.
 */
export async function deleteAliasIndices(client: Client, aliasName: string) {
  // Get status of OpenSearch:
  const statusResponse: T.IndicesStatsResponse = await client.indices.stats();

  // Remove all old timestamped indices
  if (statusResponse.indices && typeof statusResponse.indices === 'object') {
    for (const timestampedIndexName of Object.keys(statusResponse.indices)) {
      if (aliasName === timestampedIndexName.split('_', 1)[0]) {
        await deleteIndex(client, timestampedIndexName);
        console.log('Deleted index: ' + timestampedIndexName);
      }
    }
  }
}

/**
 * Count the number of documents in an index.
 *
 * @param client Elasticsearch client.
 * @param indexName Name of the index.
 * @returns Number of documents in the index.
 */
async function countIndex(client: Client, indexName: string) {
  const res = await client.count({
    index: indexName,
    body: { query: { match_all: {} } },
  });
  return res?.count;
}

/**
 * Bulk insert or update documents in an index.
 *
 * @param client Elasticsearch client.
 * @param operations Array of operations to insert or update.
 */
export async function bulk(client: Client, operations: any[]) {
  if (!operations || operations?.length === 0) return;
  const bulkResponse = await client.bulk({ refresh: true, operations });
  if (bulkResponse.errors) {
    console.log(JSON.stringify(bulkResponse, null, 2));
    throw new Error('Bulk operations failed');
  }
  console.log(
    `Bulk ${operations?.length / 2} operations completed in ${
      bulkResponse.took
    }ms`
  );
}

export function getBulkOperationArray(
  method: string,
  index: string,
  id: string | undefined,
  doc: any
): any[] {
  return [
    {
      [method]: {
        _index: index,
        ...(id && { _id: id }),
      },
    },
    method === 'update' ? { doc, doc_as_upsert: true } : { doc },
  ];
}
