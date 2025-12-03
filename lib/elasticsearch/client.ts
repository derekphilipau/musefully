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

export function getClient(): Client {
  const useCloudRaw =
    process.env.ELASTICSEARCH_USE_CLOUD ?? getEnvVar('ELASTICSEARCH_USE_CLOUD', 'false');
  const normalizedUseCloud = useCloudRaw.trim().toLowerCase();
  const isCloud =
    normalizedUseCloud === 'true' ||
    normalizedUseCloud === '1' ||
    normalizedUseCloud === 'yes';

  const baseConfig = {
    requestTimeout: 30000, // 30 second timeout for requests
    pingTimeout: 3000, // 3 second timeout for ping
    maxRetries: 2,
  };

  const clientConfig = isCloud
    ? {
        ...baseConfig,
        cloud: {
          id: getEnvVar('ELASTICSEARCH_CLOUD_ID'),
        },
        auth: {
          username: getEnvVar('ELASTICSEARCH_CLOUD_USERNAME'),
          password: getEnvVar('ELASTICSEARCH_CLOUD_PASSWORD'),
        },
      }
    : {
        ...baseConfig,
        node: getEnvVar('ELASTICSEARCH_LOCAL_NODE', DEFAULT_LOCAL_NODE),
      };

  const client = new Client(clientConfig);
  if (client === undefined) throw new Error('Cannot connect to Elasticsearch.');
  return client;
}

export const client = getClient();
