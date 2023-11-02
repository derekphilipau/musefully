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
