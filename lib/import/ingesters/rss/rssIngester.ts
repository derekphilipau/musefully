import type { BaseDocument } from '@/types/document';
import type { ElasticsearchRssIngester } from '@/types/elasticsearchRssIngester';
import { transformRssItem } from './util';

export const ingester: ElasticsearchRssIngester = {
  generateId: (doc: BaseDocument) => {
    return doc.id || '';
  },
  transform: async (item, sourceId) => {
    return transformRssItem(item, sourceId);
  },
};
