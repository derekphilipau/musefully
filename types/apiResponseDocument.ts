import type { BaseDocument } from './baseDocument';
import type { ArtworkDocument } from './artworkDocument';
import type { Term } from './term';

export interface ApiResponseDocument {
  query?: any;
  data?: BaseDocument | ArtworkDocument | Term;
  similar?: ArtworkDocument[];
}
