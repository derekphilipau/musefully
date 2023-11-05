import type {
  BaseDocument,
  DocumentConstituent,
  DocumentGeographicalLocation,
  DocumentImage,
  DocumentMuseumLocation,
} from './baseDocument';

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
