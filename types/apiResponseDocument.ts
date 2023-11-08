import type { BaseDocument, ArtworkDocument, TermDocument } from './document';

export interface ApiResponseDocument {
  query?: any;
  data?: BaseDocument | ArtworkDocument | TermDocument;
  similar?: ArtworkDocument[];
}
