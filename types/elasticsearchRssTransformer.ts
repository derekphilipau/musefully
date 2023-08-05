import type { BaseDocument } from './baseDocument';

/**
 * Function type for generating an ID for Elasticsearch documents.
 * For RSS documents, the ID is usually just the URL.
 */
export interface ElasticsearchRssIdGenerator {
  (doc: BaseDocument): string;
}

/**
 * Function type for transforming any document to a `BaseDocument` or `Term`.
 */
export interface ElasticsearchRssDocumentTransformer {
  (doc: any, sourceName: string, sourceId: string): Promise<
    BaseDocument | undefined
  >;
}

/**
 * Defines the structure of an Elasticsearch transformer, with all functions required
 * to transform data for use in Elasticsearch.
 */
export interface ElasticsearchRssTransformer {
  idGenerator: ElasticsearchRssIdGenerator;
  documentTransformer: ElasticsearchRssDocumentTransformer;
}
