import fs from 'fs';
import path from 'path';

import type { ArtworkDocument } from '@/types/document';
import { ingester } from '@/lib/import/ingesters/artworks/artworksIngester';

const FIXTURE_DIR = path.join(
  __dirname,
  '../../../../fixtures/universal-artworks'
);

function loadFixture<T>(filename: string): T {
  const filePath = path.join(FIXTURE_DIR, filename);
  const contents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(contents) as T;
}

describe('artworks ingester', () => {
  const originalCdnEnv = process.env.MUSEFULLY_IMAGE_CDN_BASE_URL;

  beforeAll(() => {
    process.env.MUSEFULLY_IMAGE_CDN_BASE_URL =
      'https://cdn.test/images';
  });

  afterAll(() => {
    process.env.MUSEFULLY_IMAGE_CDN_BASE_URL = originalCdnEnv;
  });

  it('normalizes a PMA fixture into an ArtworkDocument', async () => {
    const raw = loadFixture<Record<string, unknown>>('343820.json');
    const doc = (await ingester.transform(raw)) as ArtworkDocument | undefined;
    expect(doc).toBeDefined();
    if (!doc) return;

    expect(doc.id).toBe('343820');
    expect(doc.sourceId).toBe('pma');
    expect(doc.source).toBeUndefined();
    expect(doc.primaryConstituent?.canonicalName).toBe('Kanō Yasunobu');
    expect(doc.constituents).toHaveLength(1);
    expect(doc.classification).toEqual(['Painting']);
    expect(doc.formattedClassification).toBe('Paintings');
    expect(doc.medium).toEqual(['Ink on paper', 'hanging scroll']);
    expect(doc.formattedMedium).toBe('Ink on paper; hanging scroll');
    expect(doc.keywords).toEqual(
      expect.arrayContaining([
        'Painting',
        'Ink on paper',
        'hanging scroll',
        'ink',
      ])
    );
    expect(doc.measurements).toEqual({
      height: 20,
      width: 21,
      depth: 28,
      area: 420,
      volume: 11760,
    });
    expect(doc.searchText).toContain('2019-13-5');
    expect(doc.accessionNumber).toBe('2019-13-5');
    expect(doc.accessionDate).toBeUndefined();
    expect(doc.primaryGeographicalLocation).toEqual(
      expect.objectContaining({ name: 'Japan' })
    );
    expect(doc.geographicalLocations).toContainEqual(
      expect.objectContaining({ name: 'Japan', continent: 'Asia' })
    );
    expect(doc.hasImage).toBe(true);
    expect(doc.image?.url).toBe(
      'https://cdn.test/images/pma/main/343820.webp'
    );
    expect(doc.image?.thumbnailUrl).toBe(
      'https://cdn.test/images/pma/thumb/343820.webp'
    );
    expect(doc.image?.dominantColors?.[0]).toEqual(
      expect.objectContaining({ percent: 60, hex: '#9B8064' })
    );
    expect(doc.openAccess).toBe(true);
    expect(doc.rightsType).toBe('public-domain');
    const generatedId = ingester.generateId(doc, true);
    expect(generatedId).toBe('pma_343820');
  });

  it('handles missing source config gracefully', async () => {
    const raw = loadFixture<Record<string, unknown>>('mystery.json');
    const doc = (await ingester.transform(raw)) as ArtworkDocument | undefined;
    expect(doc).toBeDefined();
    if (!doc) return;

    expect(doc.id).toBe('MM-42');
    expect(doc.sourceId).toBe('mystery');
    expect(doc.source).toBeUndefined();
    expect(doc.classification).toEqual(['Painting']);
    expect(doc.formattedClassification).toBe('Mixed media painting');
    expect(doc.medium).toEqual(['Acrylic on panel']);
    expect(doc.formattedMedium).toBe(
      'Acrylic, pigment, and spray paint on panel'
    );
    expect(doc.materials).toEqual(['acrylic', 'pigment']);
    expect(doc.techniques).toEqual(['spray', 'splatter']);
    expect(doc.measurements).toEqual({ height: 24, width: 24, depth: 2 });
    expect(doc.primaryGeographicalLocation).toEqual(
      expect.objectContaining({ name: 'Brooklyn' })
    );
    expect(doc.geographicalLocations).toHaveLength(2);
    expect(doc.geographicalLocations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Brooklyn', country: 'United States' }),
        expect.objectContaining({ name: 'Brooklyn, New York' }),
      ])
    );
    expect(doc.collections).toEqual([
      'Mystery Highlights',
      'Abstract Showcase',
    ]);
    expect(doc.startYear).toBe(2018);
    expect(doc.endYear).toBe(2019);
    expect(doc.openAccess).toBe(false);
    expect(doc.rightsType).toBe('restricted');
    expect(doc.publicAccess).toBe(false);
    expect(doc.copyrightRestricted).toBe(true);
    expect(doc.hasImage).toBe(true);
    expect(doc.image?.url).toBe(
      'https://cdn.test/images/mystery/main/mystery_42.webp'
    );
    expect(doc.image?.thumbnailUrl).toBe(
      'https://cdn.test/images/mystery/thumb/mystery_42.webp'
    );
    expect(doc.image?.dominantColors?.[0]).toEqual(
      expect.objectContaining({ percent: 45, hex: '#1F2049' })
    );
    expect(doc.constituents).toHaveLength(2);
    expect(doc.constituents?.[1]).toEqual(
      expect.objectContaining({
        name: 'Celestial Collective',
        role: 'collaborator',
        rank: 2,
      })
    );
  });
});
