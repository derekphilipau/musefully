import type { UlanArtist } from './ulanArtist';

export interface DocumentConstituent {
  id?: string;
  name: string;
  canonicalName: string;
  prefix?: string;
  suffix?: string;
  dates?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string[];
  gender?: string;
  role?: string;
  rank?: number;
  source?: string;
  sourceId?: string;
  wikiQid?: string;
  ulan?: UlanArtist;
}

export interface DocumentGeographicalLocation {
  id?: string;
  name: string;
  continent?: string;
  country?: string;
  type?: string;
}

export interface DocumentMuseumLocation {
  id?: string;
  name?: string;
  isPublic?: boolean;
  isFloor?: boolean;
  parentId?: string;
}

export interface DocumentImageDominantColor {
  l: number;
  a: number;
  b: number;
  hex: string;
  percent: number;
}

export interface DocumentImage {
  id?: string;
  url?: string;
  thumbnailUrl?: string;
  alt?: string;
  dominantColors?: DocumentImageDominantColor[];
  date?: string;
  view?: string;
  rank?: number;
}

export interface BaseDocument {
  _id?: string;
  _index?: string;
  type?: string;
  source?: string;
  sourceId?: string;
  url?: string;
  id?: string;
  title?: string;
  description?: string;
  searchText?: string;
  keywords?: string;
  boostedKeywords?: string;
  primaryConstituent?: DocumentConstituent;
  image?: DocumentImage;
  date?: string;
  formattedDate?: string;
  startYear?: number;
  endYear?: number;
}

export interface EventDocument extends BaseDocument {
  location?: string;
  dates?: string;
  endDate?: string;
}

export interface ArchiveDocument extends BaseDocument {
  accessionNumber?: string;
  subject?: string;
  language?: string;
  publisher?: string;
  format?: string;
  rights?: string;
  relation?: string;
}

export interface ArtworkDocument extends BaseDocument {
  constituents?: DocumentConstituent[];
  images?: DocumentImage[];
  accessionNumber?: string;
  accessionDate?: string;
  period?: string;
  dynasty?: string;
  provenance?: string;
  medium?: string[];
  formattedMedium?: string;
  dimensions?: string;
  edition?: string;
  portfolio?: string;
  markings?: string;
  signed?: string;
  inscribed?: string;
  creditLine?: string;
  copyright?: string;
  classification?: string;
  publicAccess?: boolean;
  copyrightRestricted?: boolean;
  highlight?: boolean;
  section?: string;
  museumLocation?: DocumentMuseumLocation;
  onView?: boolean;
  rightsType?: string;
  labels?: string[];
  // relatedArtworks?: string[];
  departments?: string[];
  exhibitions?: string[];
  primaryGeographicalLocation?: DocumentGeographicalLocation;
  geographicalLocations?: DocumentGeographicalLocation[];
}

/**
 * An ES term document
 */
export interface TermDocument {
  source?: string;
  index: string;
  field: string;
  value: string | null;
  alternates?: string[] | null;
  summary?: string | null;
  data?: any;
}

export interface TermDocumentIdMap {
  [_id: string]: TermDocument;
}