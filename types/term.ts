/**
 * An ES term
 */
export interface Term {
  source?: string;
  index: string;
  field: string;
  value: string | null;
  alternates?: string[] | null;
  summary?: string | null;
  data?: any;
}

export interface TermIdMap {
  [_id: string]: Term;
}