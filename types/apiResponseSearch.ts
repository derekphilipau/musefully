import * as T from '@elastic/elasticsearch/lib/api/types';

import type { AggOptions } from './aggregation';
import type { BaseDocument, TermDocument } from './document';

export interface ApiResponseSearchMetadata {
  count?: number;
  pages?: number;
}

export interface ApiResponseSearch {
  query?: T.SearchRequest;
  data?: BaseDocument[];
  terms?: TermDocument[];
  filters?: TermDocument[];
  options?: AggOptions;
  metadata?: ApiResponseSearchMetadata;
  apiError?: string;
  error?: any;
}

export interface ApiResponseSuggest {
  query?: T.SearchRequest;
  data?: TermDocument[];
  metadata?: ApiResponseSearchMetadata;
  apiError?: string;
  error?: any;
}
