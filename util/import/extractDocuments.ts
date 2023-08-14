import { getClient } from '@/util/elasticsearch/client';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/util/elasticsearch/import';

import { siteConfig } from '@/config/site';

/**
 * Extract documents and update the indices.
 */
export default async function extractDocuments() {
  console.log('Import events.');
  const client = getClient();

  if (siteConfig.extractors.length === 0) {
    console.log('No extractors defined in config.');
    return;
  }

  for (const extractorName of siteConfig.extractors) {
    try {
      const { extractor } = await import(`./extract/${extractorName}`);

      await createIndexIfNotExist(client, extractor.indexName);

      let operations: any[] = [];
      const docs = await extractor.extract();
      for (const doc of docs) {
        operations.push(
          ...getBulkOperationArray(
            'update',
            extractor.indexName,
            extractor.generateId(doc),
            doc
          )
        );
      }
      if (operations.length > 0) {
        await bulk(client, operations);
      }
    } catch (e) {
      console.error(`Error extracting using ${extractorName}: ${e}`);
      return;
    }
  }
}
