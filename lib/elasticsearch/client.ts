import { Client } from '@elastic/elasticsearch';

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`Environment variable ${key} is missing`);
    }
  }
  return value;
}

const useCloud = getEnvVar('ELASTICSEARCH_USE_CLOUD');
const id = getEnvVar('ELASTICSEARCH_CLOUD_ID');
const username = getEnvVar('ELASTICSEARCH_CLOUD_USERNAME');
const password = getEnvVar('ELASTICSEARCH_CLOUD_PASSWORD');
const localNode = getEnvVar('ELASTICSEARCH_LOCAL_NODE');

export function getClient(): Client {
  const clientConfig =
    useCloud === 'true'
      ? { cloud: { id }, auth: { username, password } }
      : { node: localNode };

  const client = new Client(clientConfig);
  if (client === undefined) throw new Error('Cannot connect to Elasticsearch.');
  return client;
}

export const client = getClient();
