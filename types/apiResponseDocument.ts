import type { BaseDocument } from './baseDocument';
import type { CollectionObjectDocument } from './collectionObjectDocument';
import type { Term } from './term';

export interface ApiResponseDocument {
  query?: any;
  data?: BaseDocument | CollectionObjectDocument | Term;
  similar?: CollectionObjectDocument[];
}
