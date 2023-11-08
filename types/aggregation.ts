
/**
 * An ES bucket/aggregation option
 * Returned from ES as AggregationsStringTermsBucketKeys
 */
export interface AggOption {
  key: string;
  doc_count: number;
}

export interface Agg {
  name: string;
  displayName: string;
  options?: Array<AggOption>;
}

export interface AggOptions {
  [k: string]: AggOption[];
}
