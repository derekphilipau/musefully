/**
 * Import Elasticsearch data from JSON files.
 *
 * npx ts-node --compiler-options {\"module\":\"CommonJS\"} ./util/import/importDataCommand.ts
 */

import {
  normalizeName,
  searchUlanArtists,
} from './ulan/searchUlanArtists';

async function run() {
  const artists = [
    'Pablo Picasso',
    'Picasso, Pablo',
    'Nicolás Enríquez',
    "Shafi' Abbasi",
    'Tomman Islander',
    'Thomas Moran',
    'Egyptian',
    'James Tissot',
    'Antoine-Louis Barye',
    'Ebrié',
    "Pietro  di Giovanni d'Ambrogio",
    'Carlo Crivelli',
    'Osuitok Ipeelee',
    'Auguste Rodin',
    'Utagawa Hiroshige (Ando)',
  ];

  for (const artist of artists) {
    const result = await searchUlanArtists(artist);
    console.log(
      `Search "${artist}", normalize "${normalizeName(artist)}", result "${
        result?.preferredTerm || ''
      }"`
    );
  }
}

run();
