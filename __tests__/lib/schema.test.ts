import type { ArtworkDocument } from '@/types/document';
import { getSchemaVisualArtwork } from '@/lib/schema';

describe('getSchemaVisualArtwork', () => {
  it('should return undefined for undefined input', () => {
    const result = getSchemaVisualArtwork(undefined);
    expect(result).toBeUndefined();
  });

  it('should correctly transform a minimal ArtworkDocument', () => {
    const mockArtwork: ArtworkDocument = {
      title: 'Test Artwork',
      image: { thumbnailUrl: 'http://example.com/image.jpg' },
      description: 'A description of the artwork',
      primaryConstituent: { name: 'Artist Name', canonicalName: 'Artist Name' },
      medium: ['Oil on canvas'],
      classification: 'Painting',
      dimensions: '94 1/2 × 44 × 33 in. (240 × 111.8 × 83.8 cm)',
      copyright: 'Copyright info',
      creditLine: 'Credit info',
      formattedDate: '2023-01-01',
      keywords: ['keyword1', 'keyword2'],
    };

    const expectedSchema = {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: 'Test Artwork',
      image: 'http://example.com/image.jpg',
      abstract: 'A description of the artwork',
      creator: [{ '@type': 'Person', name: 'Artist Name' }],
      artMedium: 'Oil on canvas',
      artform: 'Painting',
      height: [{ '@type': 'Distance', name: '240 cm' }],
      width: [{ '@type': 'Distance', name: '111.8 cm' }],
      depth: [{ '@type': 'Distance', name: '83.8 cm' }],
      accessMode: 'visual',
      copyrightNotice: 'Copyright info',
      creditText: 'Credit info',
      dateCreated: '2023-01-01',
      inLanguage: 'English',
      keywords: 'keyword1, keyword2',
    };

    const result = getSchemaVisualArtwork(mockArtwork);
    expect(result).toEqual(expectedSchema);
  });

  it('should correctly transform a minimal ArtworkDocument with keywords as string', () => {
    const mockArtwork: any = {
      title: 'Test Artwork',
      image: { thumbnailUrl: 'http://example.com/image.jpg' },
      description: 'A description of the artwork',
      primaryConstituent: { name: 'Artist Name', canonicalName: 'Artist Name' },
      medium: ['Oil on canvas'],
      classification: 'Painting',
      dimensions: '94 1/2 × 44 × 33 in. (240 × 111.8 × 83.8 cm)',
      copyright: 'Copyright info',
      creditLine: 'Credit info',
      formattedDate: '2023-01-01',
      keywords: 'keyword1, keyword2',
    };

    const expectedSchema = {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: 'Test Artwork',
      image: 'http://example.com/image.jpg',
      abstract: 'A description of the artwork',
      creator: [{ '@type': 'Person', name: 'Artist Name' }],
      artMedium: 'Oil on canvas',
      artform: 'Painting',
      height: [{ '@type': 'Distance', name: '240 cm' }],
      width: [{ '@type': 'Distance', name: '111.8 cm' }],
      depth: [{ '@type': 'Distance', name: '83.8 cm' }],
      accessMode: 'visual',
      copyrightNotice: 'Copyright info',
      creditText: 'Credit info',
      dateCreated: '2023-01-01',
      inLanguage: 'English',
      keywords: 'keyword1, keyword2',
    };

    const result = getSchemaVisualArtwork(mockArtwork);
    expect(result).toEqual(expectedSchema);
  });
});
