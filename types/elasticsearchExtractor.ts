import type { BaseDocument } from './document';

/**
 * Function type for generating an ID for Elasticsearch documents.
 */
export interface ElasticsearchIdGenerator {
  (doc: BaseDocument): string;
}

/**
 * Function type for extracting any document to a `BaseDocument` array.
 */
export interface ElasticsearchDocumentExtractor {
  (): Promise<BaseDocument[]>;
}

/**
 * Defines the structure of an Elasticsearch extractor, with all functions required
 * to extract data for use in Elasticsearch.
 */
export interface ElasticsearchExtractor {
  indexName: string;
  typeName: string;
  generateId: ElasticsearchIdGenerator;
  extract: ElasticsearchDocumentExtractor;
}
