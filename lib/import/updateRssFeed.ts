import { Client } from '@elastic/elasticsearch';
import { parseStringPromise } from 'xml2js';

import type { ElasticsearchRssIngester } from '@/types/elasticsearchRssIngester';
import { siteConfig } from '@/config/site';
import { getClient } from '@/lib/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/lib/elasticsearch/import';

const INDEX_NAME = 'news';

const FETCH_TIMEOUT_MS = 10000; // 10 second timeout per feed

async function importRssFeed(
  client: Client,
  ingester: ElasticsearchRssIngester,
  url: string,
  sourceId: string
) {
  try {
    console.log(`Importing RSS feed ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const xmlString = await response.text();

    // Parse the XML string using xml2js
    const jsonObj = await parseStringPromise(xmlString);

    // Assume the <item> elements are under the 'rss.channel.item' path
    const items = jsonObj.rss.channel[0].item;

    let operations: any[] = [];

    // Iterate over each <item> and transform them
    for (const item of items) {
      const doc = await ingester.transform(item, sourceId);
      if (doc !== undefined) {
        const id = ingester.generateId(doc);
        if (doc && id) {
          operations.push(
            ...getBulkOperationArray('update', INDEX_NAME, id, doc)
          );
        }
      }
    }

    if (operations.length > 0) {
      await bulk(client, operations);
    }
  } catch (error) {
    // Re-throw with sourceId context so Promise.allSettled captures it
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[${sourceId}] ${message}`);
  }
}

/**
 */
export default async function updateRssFeeds() {
  console.log('Import RSS Feeds.');
  const client = getClient();
  await createIndexIfNotExist(client, INDEX_NAME);

  if (siteConfig.rssFeeds.length === 0) {
    console.log('No RSS feeds defined.');
    return;
  }

  const results = await Promise.allSettled(
    siteConfig.rssFeeds.map(async (rssFeed) => {
      if (!rssFeed.ingester || !rssFeed.url) {
        throw new Error(`RSS Feed ${rssFeed.sourceId} missing url or ingester`);
      }
      const { ingester } = await import(`./ingesters/rss/${rssFeed.ingester}`);
      await importRssFeed(client, ingester, rssFeed.url, rssFeed.sourceId);
      return rssFeed.sourceId;
    })
  );

  // Log results
  const succeeded = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  console.log(`RSS import complete: ${succeeded.length} succeeded, ${failed.length} failed`);
  failed.forEach((r) => {
    if (r.status === 'rejected') {
      console.error(`RSS feed failed: ${r.reason}`);
    }
  });
}
