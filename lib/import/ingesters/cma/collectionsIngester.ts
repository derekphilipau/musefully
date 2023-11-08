import type {
  ArtworkDocument,
  DocumentConstituent,
  DocumentImage,
} from '@/types/document';
import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import { searchUlanArtists } from '@/lib/import/ulan/searchUlanArtists';
import { sources } from '@/config/sources';
import { artworkTermsExtractor } from '../artworkTermsExtractor';
import {
  getStringValue,
  parseSignificantWords,
  sourceAwareIdFormatter,
} from '../ingestUtil';
import type { CmaDocument } from './types';

const DATA_FILE = './data/cma/data.jsonl.gz';
const INDEX_NAME = 'art';
const SOURCE_ID = 'cma';
const DOC_TYPE = 'artwork';

function getConstituents(doc: CmaDocument): DocumentConstituent[] {
  if (!doc.creators || !(doc.creators?.length > 0)) return [];
  const constituents: DocumentConstituent[] = [];
  for (const creator of doc.creators) {
    if (!creator.description) continue;
    // if (creator.description === 'Unknown') continue;
    // The creator is the person's name followed by their role in parentheses.
    const name = creator.description.replace(/\s+\(.*/, '');
    if (!name) continue;
    const constituent: DocumentConstituent = {
      name,
      canonicalName: name,
      dates: creator.description,
    };
    if (creator.id) constituent.id = getStringValue(creator.id);
    // Example:  "Nicolaes Berchem (Dutch, 1620\u20131683)"
    const nationality = creator.description.replace(
      /.*\((.+\,\s\d.*)\).*/,
      '$1'
    );
    if (nationality) constituent.nationality = [nationality];
    if (creator.birth_year)
      constituent.birthYear = parseInt(creator.birth_year);
    if (creator.death_year)
      constituent.deathYear = parseInt(creator.death_year);
    constituents.push(constituent);
  }
  return constituents;
}

function getDescription(doc: CmaDocument): string | undefined {
  let description = '';
  if (doc.tombstone) {
    description += doc.tombstone;
  }
  if (doc.digital_description) {
    description += ' ' + doc.digital_description;
  }
  if (doc.fun_fact) {
    description += ' ' + doc.fun_fact;
  }
  if (description) return description.trim();
}

function getImage(doc: CmaDocument): DocumentImage | undefined {
  if (doc.images) {
    if (doc.images.print?.url) {
      const image: DocumentImage = {
        url: doc.images.print.url,
        thumbnailUrl: doc.images.print.url,
      };
      if (doc.images.web?.url) {
        image.thumbnailUrl = doc.images.web.url;
      }
      return image;
    } else if (doc.images.web) {
      return {
        url: doc.images.web.url,
        thumbnailUrl: doc.images.web.url,
      } as DocumentImage;
    }
  }
}

function getProvenance(doc: CmaDocument): string | undefined {
  if (!doc.provenance) return;
  let provenance = '';
  for (const provenanceItem of doc.provenance) {
    if (provenanceItem.description)
      provenance += ' Description: ' + provenanceItem.description;
    if (provenanceItem.citations)
      provenance += ' Citations: ' + provenanceItem.citations;
    if (provenanceItem.footnotes)
      provenance += ' Footnotes: ' + provenanceItem.footnotes;
    if (provenanceItem.date) provenance += ' Date: ' + provenanceItem.date;
  }
  if (provenance) return provenance;
}

function getInscribed(doc: CmaDocument): string | undefined {
  if (!doc.inscriptions) return;
  let inscribed = '';

  for (const inscription of doc.inscriptions) {
    if (inscription.inscription) {
      inscribed += ' Inscription: ' + inscription.inscription;
    }
    if (inscription.inscription_translation) {
      inscribed += ' Translation: ' + inscription.inscription_translation;
    }
    if (inscription.inscription_remark) {
      inscribed += ' Remark: ' + inscription.inscription_remark;
    }
  }
  if (inscribed) return inscribed.trim();
}

function getExhibitions(doc: CmaDocument): string[] | undefined {
  if (!doc.exhibitions) return;
  const exhibitions: string[] = [];
  if (doc.exhibitions?.current) {
    for (const exhibition of doc.exhibitions.current) {
      let exhibitionString = '';
      if (exhibition.title) exhibitions.push(exhibition.title);
      /*
      if (exhibition.title) exhibitionString += exhibition.title;
      if (exhibition.opening_date) exhibitionString += ' ' + exhibition.opening_date;
      if (exhibition.description) exhibitionString += ' ' + exhibition.description;
      if (exhibitionString) exhibitions.push(exhibitionString);
      */
    }
  }
  if (doc.exhibitions?.legacy) {
    for (const exhibition of doc.exhibitions.legacy) {
      exhibitions.push(exhibition);
    }
  }
  if (exhibitions.length > 0) return exhibitions;
}

async function transformDoc(doc: any): Promise<ArtworkDocument> {
  const esDoc: ArtworkDocument = {
    type: DOC_TYPE,
    source: sources[SOURCE_ID]?.name,
    sourceId: SOURCE_ID,
    url: doc.url,
    id: getStringValue(doc.id),
    title: doc.title,
  };

  esDoc.description = getDescription(doc);

  esDoc.constituents = getConstituents(doc);
  if (esDoc.constituents.length > 0) {
    const ulanArtist = await searchUlanArtists(
      esDoc.constituents[0].name,
      esDoc.constituents[0].birthYear,
      esDoc.constituents[0].deathYear
    );
    if (ulanArtist?.preferredTerm) {
      esDoc.constituents[0].canonicalName = ulanArtist.preferredTerm;
      esDoc.constituents[0].ulan = ulanArtist;
    }
    esDoc.primaryConstituent = esDoc.constituents[0];
  }

  esDoc.accessionNumber = doc.accession_number;
  esDoc.searchText = doc.accession_number;

  esDoc.formattedDate = doc.creation_date;
  esDoc.startYear = doc.creation_date_earliest;
  esDoc.endYear = doc.creation_date_latest;

  esDoc.formattedMedium = doc.technique;
  esDoc.medium = parseSignificantWords(doc.technique);

  esDoc.creditLine = doc.creditline;
  esDoc.classification = doc.type;
  esDoc.departments = [doc.department];
  // TODO: doc.collection

  esDoc.dimensions = doc.measurements;
  esDoc.edition = doc.edition_of_the_work;

  esDoc.inscribed = getInscribed(doc);

  // TODO sort public access vs copyrightRestricted
  esDoc.publicAccess = doc.share_license_status === 'CC0';
  esDoc.rightsType = doc.share_license_status;
  if (doc.copyright) {
    esDoc.rightsType = doc.share_license_status + ' ' + doc.rights_type;
  }
  if (!esDoc.publicAccess) esDoc.copyrightRestricted = true;

  esDoc.image = getImage(doc);

  // period, dynasty included in culture:
  // "culture": ["Egypt, Thebes, Third Intermediate Period, late Dynasty 21 (1069-945 BC) to early Dynasty 22 (945-715 BC)"],

  esDoc.provenance = getProvenance(doc); // TODO improve provenance

  esDoc.exhibitions = getExhibitions(doc);

  if (doc.current_location) {
    esDoc.museumLocation = {
      name: doc.current_location,
    };
  }

  // TODO: Missing geographical location, find_spot not suitable

  return esDoc;
}

export const ingester: ElasticsearchIngester = {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: SOURCE_ID,
  generateId: (doc: ArtworkDocument, includeSourcePrefix: boolean) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  transform: async (doc) => {
    return transformDoc(doc);
  },
  extractTerms: async (doc: ArtworkDocument) => {
    return artworkTermsExtractor(doc, sources[SOURCE_ID]?.name);
  },
};
