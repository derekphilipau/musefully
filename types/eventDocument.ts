import type { BaseDocument } from './baseDocument';

export interface EventDocument extends BaseDocument {
  location?: string;
  dates?: string;
  endDate?: string;
}
