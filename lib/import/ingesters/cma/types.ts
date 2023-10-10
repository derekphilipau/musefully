export interface CmaImageProps {
  url?: string | null;
  width?: string | null;
  height?: string | null;
  filesize?: string | null;
  filename?: string | null;
}

export interface CmaImage {
  date_created?: string | null;
  annotation?: string | null;
  web?: CmaImageProps;
  print?: CmaImageProps;
  full?: CmaImageProps;
}

export interface CmaInscription {
  inscription: string | null;
  inscription_translation: string | null;
  inscription_remark: string | null;
}

export interface CmaCreator {
  id: number;
  description: string | null;
  extent: string | null;
  qualifier: string | null;
  role: string | null;
  biography: string | null;
  name_in_original_language: string | null;
  birth_year: string | null;
  death_year: string | null;
}

export interface CmaCitation {
  citation: string | null;
  page_number: string | null;
  url: string | null;
}

export interface CmaProvenance {
  description: string | null;
  citations: string[];
  footnotes: string | null;
  date: string | null;
}

export interface CmaExternalResource {
  wikidata: string[];
  internet_archive: string[];
}

export interface CmaExhibitions {
  current: {
    id: number;
    title: string | null;
    description: string | null;
    opening_date: string | null;
  }[];
  legacy: string[];
}

export interface CmaDimensions {
  height?: number;
  width?: number;
  depth?: number;
}

export interface CmaRelatedWork {
  id: number;
  description: string | null;
  relationship: string | null;
}

export interface CmaDocument {
  id: number;
  accession_number: string | null;
  share_license_status: string | null;
  tombstone: string | null;
  current_location: string | null;
  title: string | null;
  title_in_original_language: string | null;
  series: string | null;
  series_in_original_language: string | null;
  creation_date: string | null;
  creation_date_earliest: number;
  creation_date_latest: number;
  artists_tags: string[];
  culture: string[];
  technique: string | null;
  support_materials: string[];
  department: string | null;
  collection: string | null;
  type: string | null;
  measurements: string | null;
  dimensions: {
    [key: string]: CmaDimensions;
  };
  state_of_the_work: string | null;
  edition_of_the_work: string | null;
  copyright: string | null;
  inscriptions: CmaInscription[];
  exhibitions: CmaExhibitions;
  provenance: CmaProvenance[];
  find_spot: string | null;
  related_works: CmaRelatedWork[];
  former_accession_numbers: string[];
  fun_fact: string | null;
  digital_description: string | null;
  wall_description: string | null;
  external_resources: CmaExternalResource;
  citations: CmaCitation[];
  catalog_raisonne: string | null;
  url: string | null;
  images: CmaImage;
  alternate_images: CmaImage[];
  creditline: string | null;
  sketchfab_id: string | null;
  sketchfab_url: string | null;
  creators: CmaCreator[];
  updated_at: string | null;
}
