import slugify from 'slugify';

import type { ArtworkDocument } from '@/types/artworkDocument';
import type { Term, TermIdMap } from '@/types/term';
import { normalizeName, searchUlanArtists } from '@/util/import/ulan/searchUlanArtists';

/**
 * Terms are significant fields that may contain additiona metadata are
 * used for search-as-you-type.
 *
 * @param doc Elasticsearch document representing an artwork
 */
export async function artworkTermsExtractor(
  doc: ArtworkDocument,
  datasourceName: string
): Promise<TermIdMap> {
  const termIdMap: TermIdMap = {};
  if (doc.departments?.length) {
    for (const department of doc.departments) {
      termIdMap[`art-departments-${slugify(department)}`] = {
        source: datasourceName,
        index: 'art',
        field: 'departments',
        value: department,
      };
    }
  }
  if (doc.classification) {
    termIdMap[`art-classification-${slugify(doc.classification)}`] = {
      source: datasourceName,
      index: 'art',
      field: 'classification',
      value: doc.classification,
    };
  }
  const primaryConstituent = doc.primaryConstituent;
  if (primaryConstituent?.id && primaryConstituent?.name) {
    const ulanArtist = await searchUlanArtists(
      primaryConstituent.canonicalName,
      primaryConstituent.birthYear,
      primaryConstituent.deathYear
    );
    let term: Term;
    if (ulanArtist?.preferredTerm) {
      term = {
        source: 'ulan',
        index: 'art',
        field: 'primaryConstituent.canonicalName',
        value: ulanArtist.preferredTerm,
        alternates: ulanArtist.nonPreferredTerms,
        summary: ulanArtist.biography,
        data: ulanArtist,
      } as Term;
    } else {
      term = {
        source: datasourceName,
        index: 'art',
        field: 'primaryConstituent.canonicalName',
        value: primaryConstituent.canonicalName,
        summary: primaryConstituent.dates,
      } as Term;
    }
    if (term.value) {
      const id = slugify(normalizeName(term.value));
      termIdMap[`art-primaryConstituent.canonicalName-${id}`] = term;
    }
  }
  return termIdMap;
}
