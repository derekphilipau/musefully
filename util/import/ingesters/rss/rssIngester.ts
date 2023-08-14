import type { BaseDocument } from '@/types/baseDocument';
import type { ElasticsearchRssIngester } from '@/types/elasticsearchRssIngester';
import { transformRssItem } from './util';

export const ingester: ElasticsearchRssIngester = {
  generateId: (doc: BaseDocument) => {
    return doc.id || '';
  },
  transform: async (item, sourceName, sourceId) => {
    return transformRssItem(item, sourceName, sourceId);
  },
};
