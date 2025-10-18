import slugify from 'slugify';

import type { ArtworkDocument, TermDocument, TermDocumentIdMap } from '@/types/document';
/**
 * Terms are significant fields that may contain additional metadata used
 * for search-as-you-type.
 */
export async function artworkTermsExtractor(
  doc: ArtworkDocument,
  sourceName: string
): Promise<TermDocumentIdMap> {
  const termIdMap: TermDocumentIdMap = {};
  if (doc.departments?.length) {
    for (const department of doc.departments) {
      termIdMap[`art-departments-${slugify(department)}`] = {
        source: sourceName,
        index: 'art',
        field: 'departments',
        value: department,
      };
    }
  }
  if (doc.classification?.length) {
    const seenClassifications = new Set<string>();
    for (const classification of doc.classification) {
      const trimmed = classification?.trim();
      if (!trimmed || seenClassifications.has(trimmed.toLowerCase())) continue;
      const slug = slugify(trimmed, { lower: true, strict: true });
      if (!slug) continue;
      termIdMap[`art-classification-${slug}`] = {
        source: sourceName,
        index: 'art',
        field: 'classification',
        value: trimmed,
      };
      seenClassifications.add(trimmed.toLowerCase());
    }
  }
  const primaryConstituent = doc.primaryConstituent;
  if (primaryConstituent) {
    const canonicalName =
      primaryConstituent.canonicalName?.trim() ||
      primaryConstituent.name?.trim();

    if (canonicalName) {
      const term: TermDocument = {
        source: sourceName,
        index: 'art',
        field: 'primaryConstituent.canonicalName',
        value: canonicalName,
        summary:
          primaryConstituent.dates ||
          [primaryConstituent.birthYear, primaryConstituent.deathYear]
            .filter((value) => value !== undefined)
            .join('–') ||
          undefined,
      };

      const alternates = doc.constituents
        ?.map((constituent) => constituent?.canonicalName?.trim())
        .filter(
          (name): name is string =>
            !!name && name.toLowerCase() !== canonicalName.toLowerCase()
        );
      if (alternates?.length) {
        term.alternates = Array.from(new Set(alternates));
      }

      const termData: Record<string, unknown> = {};
      if (primaryConstituent.ulanId) termData.id = primaryConstituent.ulanId;
      else if (primaryConstituent.ulanUrl)
        termData.id = primaryConstituent.ulanUrl.split('/').pop();
      if (primaryConstituent.biography)
        termData.biography = primaryConstituent.biography;
      if (Object.keys(termData).length > 0) {
        term.data = termData;
      }

      const slug = slugify(canonicalName, { lower: true, strict: true });
      if (slug) {
        termIdMap[`art-primaryConstituent.canonicalName-${slug}`] = term;
      }
    }
  }

  return termIdMap;
}
