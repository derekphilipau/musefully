import { getClient } from '@/util/elasticsearch/client';
import { bulk, getBulkOperationArray } from '@/util/elasticsearch/import';
import { searchAll } from '@/util/elasticsearch/search/search';
import { loadJsonFile } from '@/util/jsonUtil';

const ulanArtistsFile = './data/ULAN/json/ulanArtists.jsonl.gz';
const ulanCorporateBodiesFile = './data/ULAN/json/ulanCorporateBodies.jsonl.gz';

function simplifyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(professor\s)/i, '')
    .replace(/&amp;\s/, '') // Remove ampersand code
    .replace(/\w+\.\s/, '') // Remove name abbreviations
    .replace(/,\s\w+\.$/, '') // Remove ending abbreviations
    .normalize('NFD') // Remove diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();
}

function checkMatchedArtistTerms(ulanMatches, birthYear, deathYear) {
  if (ulanMatches?.length === 1) {
    // Great, found a single matching record for ULAN preferred term.
    return ulanMatches[0];
  } else if (ulanMatches?.length > 1) {
    // Found multiple matching records for ULAN preferred term.
    let temporaryConfirmedUlanArtist = null;
    for (const ulanArtist of ulanMatches) {
      if (
        parseInt(ulanArtist.birthDate) === birthYear &&
        parseInt(ulanArtist.deathDate) === deathYear
      ) {
        return ulanArtist;
      } else {
        if (parseInt(ulanArtist.deathDate) === deathYear) {
          // Only end date match, keep looping just in case there's a better match.
          temporaryConfirmedUlanArtist = ulanArtist;
        }
        if (parseInt(ulanArtist.birthDate) === birthYear) {
          // Only start date match, keep looping just in case there's a better match.
          temporaryConfirmedUlanArtist = ulanArtist;
        }
      }
    }
    if (temporaryConfirmedUlanArtist) {
      return temporaryConfirmedUlanArtist;
    }
  }
  return null;
}

/**
 *
 * @param term
 * @param ulanArtists
 * @param ulanCorporateBodies
 * @returns
 */
async function getUlanData(term, ulanArtists, ulanCorporateBodies) {
  const constituent = term.data;
  const constituentName = term.value;
  if (!constituentName.length) return;

  const simplifiedName = simplifyName(constituentName);

  const preferredTerms = ulanArtists.filter(
    (a) => a.cleanPreferredTerm === simplifiedName
  );
  let ulanArtist = checkMatchedArtistTerms(
    preferredTerms,
    constituent.birthYear,
    constituent.deathYear
  );
  if (!ulanArtist) {
    const alternateTerms = ulanArtists.filter(
      (a) =>
        a.cleanNonPreferredTerms?.length > 0 &&
        a.cleanNonPreferredTerms.includes(simplifiedName)
    );
    ulanArtist = checkMatchedArtistTerms(
      alternateTerms,
      constituent.birthYear,
      constituent.deathYear
    );
  }
  if (!ulanArtist) {
    const preferredCorporateTerms = ulanCorporateBodies.filter(
      (a) => a.cleanPreferredTerm === simplifiedName
    );
    ulanArtist = checkMatchedArtistTerms(
      preferredCorporateTerms,
      constituent.birthYear,
      constituent.deathYear
    );
    if (!ulanArtist) {
      const alternateCorporateTerms = ulanCorporateBodies.filter(
        (a) =>
          a.cleanNonPreferredTerms?.length > 0 &&
          a.cleanNonPreferredTerms.includes(simplifiedName)
      );
      ulanArtist = checkMatchedArtistTerms(
        alternateCorporateTerms,
        constituent.birthYear,
        constituent.deathYear
      );
    }
  }
  if (ulanArtist) {
    const alternates: string[] = [];
    if (ulanArtist.nonPreferredTerms?.length > 0) {
      const cleanArtist = simplifyName(constituentName);
      const cleanPreferredTerm = simplifyName(ulanArtist.preferredTerm);
      for (const alt of ulanArtist.nonPreferredTerms) {
        const cleanAlt = simplifyName(alt);
        if (
          cleanArtist.includes(cleanAlt) ||
          cleanPreferredTerm.includes(cleanAlt)
        )
          continue;
        alternates.push(cleanAlt);
      }
    }
    const uniqueAlternates = [...new Set(alternates)]; // Remove duplicates

    term.alternates = uniqueAlternates; // Assumes alternates not already populated
    term.data.ulan = {
      id: ulanArtist.id,
      type: ulanArtist.type,
      descriptiveNotes: ulanArtist.descriptiveNotes,
      biography: ulanArtist.biography,
      sex: ulanArtist.sex,
    };
    return term;
  }
}

async function getPrimaryConstituentTerms(): Promise<any[]> {
  const hits: any[] = await searchAll('terms', {
    match: {
      field: 'primaryConstituent',
    },
  });
  return hits;
}

export async function updateUlanTerms() {
  const ulanArtists = await loadJsonFile(ulanArtistsFile);
  const ulanCorporateBodies = await loadJsonFile(ulanCorporateBodiesFile);

  for (const c of ulanArtists) {
    c.cleanPreferredTerm = simplifyName(c.preferredTerm);
    if (c.nonPreferredTerms?.length > 0)
      c.cleanNonPreferredTerms = c.nonPreferredTerms.map((n) =>
        simplifyName(n)
      );
    else c.cleanNonPreferredTerms = [];
  }
  for (const c of ulanCorporateBodies) {
    c.cleanPreferredTerm = simplifyName(c.preferredTerm);
    if (c.nonPreferredTerms?.length > 0)
      c.cleanNonPreferredTerms = c.nonPreferredTerms.map((n) =>
        simplifyName(n)
      );
    else c.cleanNonPreferredTerms = [];
  }

  console.log(`ULAN artists: ${ulanArtists.length}`);
  console.log(`ULAN corporate bodies: ${ulanCorporateBodies.length}`);

  const hits = await getPrimaryConstituentTerms();
  console.log('Found', hits.length, 'hits with primary constituent.');
  const operations: any[] = [];
  for (const hit of hits) {
    const ulanMatch = await getUlanData(hit._source, ulanArtists, ulanCorporateBodies);
    if (ulanMatch) {
      // Great, found a single matching record for ULAN preferred term.
      operations.push(...getBulkOperationArray('update', 'terms', hit._id, ulanMatch));

    }
  }
  console.log(`Found ${operations.length/2} ULAN records.`);
  if (!operations.length) return;
  const client = getClient();

  await bulk(client, operations);
  console.log(`Updated terms with ${operations.length/2} ULAN records.`);
}
