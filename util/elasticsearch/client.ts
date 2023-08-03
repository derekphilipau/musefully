import { readFileSync } from 'fs';
import { Client } from '@elastic/elasticsearch';

export const ERR_CONFIG =
  'Missing environment variables for Elasticsearch connection.';
export const ERR_CLIENT = 'Cannot connect to Elasticsearch.';

/**
 * Get an Elasticsearch client, either cloud or host-based.
 *
 * @returns Elasticsearch client
 */
export function getClient(): Client {
  if (process.env.ELASTICSEARCH_USE_CLOUD === 'true') {
    const id = process.env.ELASTICSEARCH_CLOUD_ID;
    const username = process.env.ELASTICSEARCH_CLOUD_USERNAME;
    const password = process.env.ELASTICSEARCH_CLOUD_PASSWORD;
    if (!id || !username || !password) throw new Error(ERR_CONFIG);
    const clientSettings = {
      cloud: { id },
      auth: { username, password },
    };
    const client = new Client(clientSettings);
    if (client === undefined) throw new Error(ERR_CLIENT);
    return client;
  }

  const caFile = process.env.ELASTICSEARCH_CA_FILE;
  const node = `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`;
  const apiKey = process.env.ELASTICSEARCH_API_KEY;
  if (!caFile || !node || !apiKey) throw new Error(ERR_CONFIG);
  const ca = readFileSync(caFile);
  const clientSettings = {
    node,
    auth: {
      apiKey,
    },
    tls: {
      ca,
      rejectUnauthorized: false,
    },
  };
  const client = new Client(clientSettings);
  if (client === undefined) throw new Error(ERR_CLIENT);
  return client;
}
