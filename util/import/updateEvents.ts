import { getClient } from '@/util/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/util/elasticsearch/import';

import { siteConfig } from '@/config/site';

const INDEX_NAME = 'events';

/**
 * Crawl events and update the index.
 */
export default async function updateEvents() {
  console.log('Import events.');
  const client = getClient();
  await createIndexIfNotExist(client, INDEX_NAME);

  if (siteConfig.eventCrawlers.length === 0) {
    console.log('No event crawlers defined in config.');
    return;
  }

  for (const eventConfig of siteConfig.eventCrawlers) {
    try {
      const { crawler } = await import(`./transform/events/${eventConfig}`);

      let operations: any[] = [];
      const events = await crawler.crawl();
      for (const event of events) {
        operations.push(
          ...getBulkOperationArray(
            'update',
            INDEX_NAME,
            event.url,
            event
          )
        );
      }
      if (operations.length > 0) {
        await bulk(client, operations);
      }
    } catch (e) {
      console.error(`Error crawling events ${eventConfig}: ${e}`);
      return;
    }
  }
}
