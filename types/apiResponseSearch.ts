import * as T from '@elastic/elasticsearch/lib/api/types';

import type { AggOptions } from './aggOptions';
import type { BaseDocument } from './baseDocument';
import type { Term } from './term';

export interface ApiResponseSearchMetadata {
  count?: number;
  pages?: number;
}

export interface ApiResponseSearch {
  query?: T.SearchRequest;
  data?: BaseDocument[];
  terms?: Term[];
  filters?: Term[];
  options?: AggOptions;
  metadata?: ApiResponseSearchMetadata;
  apiError?: string;
  error?: any;
}

export interface ApiResponseSuggest {
  query?: T.SearchRequest;
  data?: Term[];
  metadata?: ApiResponseSearchMetadata;
  apiError?: string;
  error?: any;
}
