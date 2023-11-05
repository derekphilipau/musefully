import type { BaseDocument, TermDocumentIdMap } from './document';

/**
 * Function type for generating an ID for Elasticsearch documents.
 * `includeSourcePrefix` is an optional flag to include a source prefix in the ID,
 * used when there are multiple sources to avoid ID collisions.
 */
export interface ElasticsearchIdGenerator {
  (doc: BaseDocument, includeSourcePrefix?: boolean): string;
}

/**
 * Function type for extracting terms from a `BaseDocument`.  Optional.
 */
export interface ElasticsearchTermsExtractor {
  (doc: BaseDocument): Promise<TermDocumentIdMap | undefined>;
}

/**
 * Function type for transforming any document to a `BaseDocument` or `TermDocument`.
 */
export interface ElasticsearchTransform {
  (doc: any): Promise<BaseDocument | undefined>;
}

/**
 * Defines the structure of an Elasticsearch ingester, with all functions required
 * to ingest & transform data for use in Elasticsearch.
 */
export interface ElasticsearchIngester{
  indexName: string;
  dataFilename: string;
  sourceId: string;
  sourceName: string;
  generateId: ElasticsearchIdGenerator;
  transform: ElasticsearchTransform;
  extractTerms?: ElasticsearchTermsExtractor;
}
