import { loadEnvConfig } from '@next/env';

import updateRssFeeds from './updateRssFeed';

loadEnvConfig(process.cwd());

async function run() {
  console.log('RSS Feed Import');
  console.log(
    `Elasticsearch: ${
      process.env.ELASTICSEARCH_USE_CLOUD === 'true'
        ? 'Cloud'
        : process.env.ELASTICSEARCH_LOCAL_NODE || 'http://localhost:9200'
    }`
  );

  const start = Date.now();
  await updateRssFeeds();
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\nCompleted in ${elapsed}s`);
}

run();
