import type { BaseDocument } from '@/types/baseDocument';
import type { ElasticsearchTransformer } from '@/types/elasticsearchTransformer';
import { urlIdFormatter } from '../transformUtil';

export const transformer: ElasticsearchTransformer = {
  idGenerator: (doc: BaseDocument) => {
    return urlIdFormatter(doc.url);
  },
  documentTransformer: async (doc) => {
    return {
      type: 'content',
      source: 'bkm',
      url: doc.url,
      title: doc.title,
      searchText: doc.text,
      keywords: doc.keywords,
      image: {
        url: doc.image,
        thumbnailUrl: doc.image,
      },
    } as BaseDocument;
  },
};
