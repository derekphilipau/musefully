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

const DEFAULT_LOCAL_NODE = 'http://localhost:9200';

const useCloud = getEnvVar('ELASTICSEARCH_USE_CLOUD', 'false');

export function getClient(): Client {
  const clientConfig =
    useCloud === 'true'
      ? {
          cloud: {
            id: getEnvVar('ELASTICSEARCH_CLOUD_ID'),
          },
          auth: {
            username: getEnvVar('ELASTICSEARCH_CLOUD_USERNAME'),
            password: getEnvVar('ELASTICSEARCH_CLOUD_PASSWORD'),
          },
        }
      : {
          node: getEnvVar('ELASTICSEARCH_LOCAL_NODE', DEFAULT_LOCAL_NODE),
        };

  const client = new Client(clientConfig);
  if (client === undefined) throw new Error('Cannot connect to Elasticsearch.');
  return client;
}

export const client = getClient();
