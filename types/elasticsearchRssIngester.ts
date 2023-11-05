import type { BaseDocument } from './document';

/**
 * Function type for generating an ID for Elasticsearch documents.
 * For RSS documents, the ID is usually just the URL.
 */
export interface ElasticsearchRssIdGenerator {
  (doc: BaseDocument): string;
}

/**
 * Function type for transforming any document to a `BaseDocument`.
 */
export interface ElasticsearchRssTransform {
  (doc: any, sourceName: string, sourceId: string): Promise<
    BaseDocument | undefined
  >;
}

/**
 * Defines the structure of an Elasticsearch transformer, with all functions required
 * to transform data for use in Elasticsearch.
 */
export interface ElasticsearchRssIngester {
  generateId: ElasticsearchRssIdGenerator;
  transform: ElasticsearchRssTransform;
}
