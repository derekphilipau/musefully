import { getClient } from '@/util/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/util/elasticsearch/import';
import { Client } from '@elastic/elasticsearch';
import { parseStringPromise } from 'xml2js';

import type { ElasticsearchRssTransformer } from '@/types/elasticsearchRssTransformer';
import { siteConfig, type RssFeed } from '@/config/site';

const INDEX_NAME = 'content';

async function importRssFeed(
  client: Client,
  transformer: ElasticsearchRssTransformer
) {
  try {
    console.log(`Importing RSS feed ${transformer.url}...`);
    const response = await fetch(transformer.url);
    const xmlString = await response.text();

    // Parse the XML string using xml2js
    const jsonObj = await parseStringPromise(xmlString);

    // Assume the <item> elements are under the 'rss.channel.item' path
    const items = jsonObj.rss.channel[0].item;

    let operations: any[] = [];

    // Iterate over each <item> and transform them
    for (const item of items) {
      const doc = await transformer.documentTransformer(item);
      console.log(doc);
      if (doc !== undefined) {
        const id = transformer.idGenerator(doc);
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
      const { transformer } = await import(
        `./transform/rss/${rssFeed.sourceName}Transformer`
      );
      await importRssFeed(client, transformer);
    } catch (e) {
      console.error(`Error updating RSS ${rssFeed.sourceName}: ${e}`);
      return;
    }
  }
}
