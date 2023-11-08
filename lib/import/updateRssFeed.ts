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

async function importRssFeed(
  client: Client,
  ingester: ElasticsearchRssIngester,
  url: string,
  sourceId: string
) {
  try {
    console.log(`Importing RSS feed ${url}...`);
    const response = await fetch(url);
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
    console.error('An error occurred:', error);
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

  for (const rssFeed of siteConfig.rssFeeds) {
    try {
      if (!rssFeed.ingester || !rssFeed.url)
        throw new Error('RSS Feed missing url');
      const { ingester } = await import(`./ingesters/rss/${rssFeed.ingester}`);
      await importRssFeed(
        client,
        ingester,
        rssFeed.url,
        rssFeed.sourceId
      );
    } catch (e) {
      console.error(`Error updating RSS ${rssFeed.sourceId}: ${e}`);
      return;
    }
  }
}
