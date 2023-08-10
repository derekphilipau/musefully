import type { BaseDocument } from '@/types/baseDocument';
import type { ElasticsearchRssTransformer } from '@/types/elasticsearchRssTransformer';
import { transformRssItem } from './util';

export const transformer: ElasticsearchRssTransformer = {
  idGenerator: (doc: BaseDocument) => {
    return doc.id || '';
  },
  transformer: async (item, sourceName, sourceId) => {
    return transformRssItem(item, sourceName, sourceId);
  },
};
