import type { ArtworkDocument, DocumentImage } from '@/types/document';
import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import { searchUlanArtists } from '@/lib/import/ulan/searchUlanArtists';
import { artworkTermsExtractor } from '../artworkTermsExtractor';
import {
  getStringValue,
  parseSignificantWords,
  sourceAwareIdFormatter,
} from '../ingestUtil';
import type { BkmImage } from './types';
import {
  getLargeOrRestrictedImageUrl,
  getSmallOrRestrictedImageUrl,
} from './util';

const DATA_FILE = './data/bkm/collections.jsonl.gz';
const INDEX_NAME = 'art';
const SOURCE_ID = 'bkm';
const SOURCE_NAME = 'Brooklyn Museum';
const DOC_TYPE = 'artwork';
const NOT_ON_VIEW = 'This item is not on view';
const NOT_ASSIGNED = '(not assigned)';

const UNKNOWN = 'Unknown';
const UNKNOWN_ARTIST = 'Unknown Artist';
const MAKER_UNKNOWN = 'Maker Unknown';

/**
 * Sometimes the item's main image (item.image.url) is ranked at the same level
 * as other item images.  Force the main image to have the highest rank (0).
 */
function getSortedImages(
  images: DocumentImage[],
  url: string | undefined
): DocumentImage[] {
  if (!url || !images?.length) return images;
  const index = images.findIndex((o) => o.url === url);
  if (index !== -1 && images[index]?.rank) {
    images[index].rank = 0;
  }
  return images.sort((a, b) => (a.rank || 0) - (b.rank || 0));
}

async function transformDoc(doc: any): Promise<ArtworkDocument> {
  const esDoc: ArtworkDocument = {
    // Begin BaseDocument fields
    type: DOC_TYPE,
    source: SOURCE_NAME,
    sourceId: SOURCE_ID,
    id: getStringValue(doc.id),
    title: doc.title || undefined,
    url: `https://www.brooklynmuseum.org/opencollection/objects/${getStringValue(
      doc.id
    )}`,
  };

  if (doc.labels?.length) {
    for (const label of doc.labels) {
      if (label.approved_for_web === 1) {
        esDoc.description = label.content || undefined;
      }
    }
  }

  if (doc.accession_number) {
    esDoc.accessionNumber = doc.accession_number; // "14.301a-e"
    esDoc.searchText = doc.accession_number;
  }
  if (doc.accession_date)
    esDoc.accessionDate = new Date(doc.accession_date).toISOString();
  if (doc.object_date) esDoc.formattedDate = doc.object_date; // "18th century"

  // Handle dates:
  if (Number.isInteger(doc.object_date_begin)) {
    // date is either an integer or null
    esDoc.startYear = doc.object_date_begin;
  }

  // Handle dates.  In Brooklyn Museum, the start & end dates are either year numbers or null.
  let endYear = doc.object_date_end;
  if (
    doc.object_date_begin &&
    doc.object_date_end &&
    doc.object_date_begin >= 0 &&
    doc.object_date_end < doc.object_date_begin
  ) {
    // Sometimes end date is defaulted to 0 even though start date is a year like 2017.
    // Note: Only works for AD dates.
    endYear = doc.object_date_begin;
  }

  // If the date is just a year, convert it to an ISO date string.
  if (Number.isInteger(endYear)) {
    esDoc.endYear = endYear;
  }

  if (doc.period) esDoc.period = doc.period; // "Qianlong Period"
  if (doc.dynasty) esDoc.dynasty = doc.dynasty; // "Qing Dynasty"

  if (doc.medium) {
    // Medium is a free-form comma-delimited list of materials.  Split it into an array.
    // The array of materials is stored in the medium field,
    // while the entire string is stored in the formattedMedium field.
    esDoc.formattedMedium = doc.medium;
    esDoc.medium = parseSignificantWords(doc.medium);
  }

  if (doc.provenance) esDoc.provenance = doc.provenance;
  if (doc.dimensions) esDoc.dimensions = doc.dimensions;
  if (doc.edition) esDoc.edition = doc.edition;
  if (doc.portfolio) esDoc.portfolio = doc.portfolio;
  // TODO: inscribed line endings: "松芝多秀色\r\n鶴語記春秋\r\n福如東海島\r\n蓬萊赴蟠桃\r\n\r\nThe pine trees and lingzhi fungi form a beautiful scenery;\r\nThe crane’s call is a record of the Spring and Autumn period;\r\nWith happiness as boundless as the eastern seas and islands;\r\nI attend a banquet of immortality peaches on the Penglai isles.\r\n\r\nInscribed by order of the Qianlong emperor.\r\n\r\n"
  if (doc.inscribed) esDoc.inscribed = doc.inscribed;
  if (doc.credit_line) esDoc.creditLine = doc.credit_line;
  if (doc.copyright) esDoc.copyright = doc.copyright;
  if (doc.classification && doc.classification != NOT_ASSIGNED)
    esDoc.classification = doc.classification; // e.g. "Vessel"
  if (doc.public_access) esDoc.publicAccess = doc.public_access === 1;
  if (doc.copyright_restricted)
    esDoc.copyrightRestricted = doc.copyright_restricted === 1;
  if (doc.section) esDoc.section = doc.section;
  if (doc.highlight) esDoc.highlight = doc.highlight === 1;
  esDoc.onView = false;
  if (doc.museum_location?.name === NOT_ON_VIEW) {
    esDoc.museumLocation = {
      name: NOT_ON_VIEW,
      isPublic: false,
      isFloor: false,
    };
  } else if (doc.museum_location?.id) {
    esDoc.onView = true;
    esDoc.museumLocation = {
      id: getStringValue(doc.museum_location.id),
      name: doc.museum_location.name || undefined,
      isPublic: doc.museum_location.is_public === 1,
      isFloor: doc.museum_location.is_floor,
      parentId: doc.museum_location.parent_location_id
        ? getStringValue(doc.museum_location.parent_location_id)
        : undefined,
    };
  }

  if (doc.rights_type?.name !== '(not assigned)') {
    esDoc.rightsType = doc.rights_type?.public_name || undefined;
  }

  if (doc.artists?.length) {
    esDoc.constituents = doc.artists.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      canonicalName: artist.name,
      prefix: artist.prefix, // Role adjective: "Attributed to"
      suffix: artist.suffix, // Mixed bag: "School", "or", "Style", "Northern"
      dates: artist.dates,
      birthYear: artist.start_year,
      deathYear: artist.end_year,
      nationality: [artist.nationality], // "American"
      role: artist.role,
      rank: artist.rank,
      source: SOURCE_NAME,
      sourceId: artist.id,
    }));

    if (esDoc.constituents?.length) {
      // Remove constituents with hard-coded unknown values
      esDoc.constituents = esDoc.constituents.filter(
        (c) =>
          c.name !== UNKNOWN &&
          c.name !== UNKNOWN_ARTIST &&
          c.name !== MAKER_UNKNOWN
      );
    }

    if (esDoc.constituents?.length) {
      // Determine index of primary constituent:
      let primaryConstituentIndex = 0;
      if (esDoc.constituents.length > 1) {
        // Most rankings are zero-based, but constituents may be one-based?
        primaryConstituentIndex = esDoc.constituents.findIndex(
          (c) => c.rank === 0
        );
        if (primaryConstituentIndex < 0) {
          primaryConstituentIndex = esDoc.constituents.findIndex(
            (c) => c.rank === 1
          );
        }
      }
      if (primaryConstituentIndex >= 0) {
        // Check for canonical ULAN name of this artist:
        const ulanArtist = await searchUlanArtists(
          esDoc.constituents[primaryConstituentIndex].name,
          esDoc.constituents[primaryConstituentIndex].birthYear,
          esDoc.constituents[primaryConstituentIndex].deathYear
        );
        if (ulanArtist?.preferredTerm) {
          esDoc.constituents[primaryConstituentIndex].canonicalName =
            ulanArtist.preferredTerm;
          esDoc.constituents[primaryConstituentIndex].ulan = ulanArtist;
        }
        esDoc.primaryConstituent = esDoc.constituents[primaryConstituentIndex];
      }
    }
  }

  if (doc.collections?.length) {
    esDoc.departments = doc.collections?.map(
      (collection: any) => collection.name
    );
  }
  if (doc.exhibitions?.length) {
    esDoc.exhibitions = doc.exhibitions?.map(
      (exhibition: any) => exhibition.title
    );
  }

  /*
  // Don't use their related artworks
  esDoc.relatedArtworks = doc.related_items?.map(
    (related: any) => related.object_id
  );
  */

  if (doc.geographical_locations?.length) {
    // TODO: get continent, country, etc.
    esDoc.geographicalLocations = doc.geographical_locations.map(
      (location: any) => ({
        id: location.id,
        name: location.name,
        continent: location.continent,
        country: location.country,
        type: location.type,
      })
    );
    if (esDoc.geographicalLocations?.length) {
      esDoc.primaryGeographicalLocation = esDoc.geographicalLocations[0];
    }
  }

  let primaryImageInArray = true;
  if (doc.primary_image) {
    const myImage = doc.images?.find(
      (image: BkmImage) => image.filename === doc.primary_image
    );
    if (!myImage) {
      // Sometimes primary image isn't in list of all images
      primaryImageInArray = false;
      esDoc.image = {
        id: doc.primary_image,
        url: getLargeOrRestrictedImageUrl(
          doc.primary_image,
          esDoc.copyrightRestricted
        ),
        thumbnailUrl: getSmallOrRestrictedImageUrl(
          doc.primary_image,
          esDoc.copyrightRestricted
        ),
        rank: 0, // should always be zero
      };
    } else {
      esDoc.image = {
        id: getStringValue(myImage.id),
        url: getLargeOrRestrictedImageUrl(
          myImage.filename,
          esDoc.copyrightRestricted
        ),
        thumbnailUrl: getSmallOrRestrictedImageUrl(
          myImage.filename,
          esDoc.copyrightRestricted
        ),
        alt: myImage.description || undefined,
        date: myImage.date || undefined,
        view: myImage.view || undefined,
        rank: 0, // should always be zero
      };
    }
  }

  if (doc.images?.length) {
    const unsortedImages: DocumentImage[] = doc.images.map(
      (image: BkmImage) => ({
        id: getStringValue(image.id),
        url: getLargeOrRestrictedImageUrl(
          image.filename,
          esDoc.copyrightRestricted
        ),
        thumbnailUrl: getSmallOrRestrictedImageUrl(
          image.filename,
          esDoc.copyrightRestricted
        ),
        alt: image.description || undefined,
        date: image.date || undefined,
        view: image.view || undefined,
        rank: image.rank || 10, // default to low rank
      })
    );
    if (!primaryImageInArray && doc.primary_image) {
      // If primary image wasn't in list of all images, add it
      unsortedImages.unshift({
        id: doc.primary_image,
        url: getLargeOrRestrictedImageUrl(
          doc.primary_image,
          esDoc.copyrightRestricted
        ),
        thumbnailUrl: getSmallOrRestrictedImageUrl(
          doc.primary_image,
          esDoc.copyrightRestricted
        ),
        rank: 0,
      });
    }
    esDoc.images = getSortedImages(unsortedImages, esDoc.image?.url);
  }
  return esDoc;
}

export const ingester: ElasticsearchIngester = {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: SOURCE_ID,
  sourceName: SOURCE_NAME,
  generateId: (doc: ArtworkDocument, includeSourcePrefix: boolean) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  transform: async (doc) => {
    return transformDoc(doc);
  },
  extractTerms: async (doc: ArtworkDocument) => {
    return artworkTermsExtractor(doc, SOURCE_NAME);
  },
};
