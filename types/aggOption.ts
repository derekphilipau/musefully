/**
 * An ES bucket/aggregation option
 * Returned from ES as AggregationsStringTermsBucketKeys
 */
export interface AggOption {
  key: string;
  doc_count: number;
}
