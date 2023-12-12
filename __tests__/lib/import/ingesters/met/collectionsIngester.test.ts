import { ingester } from '@/lib/import/ingesters/met/collectionsIngester';
import { ArtworkDocument } from '@/types/document';

const mockMetDocument = {
  'Object Number': '04.1a–c',
  'Is Highlight': true,
  'Is Timeline Work': true,
  'Is Public Domain': false,
  'Object ID': 35,
  'Gallery Number': 706,
  Department: 'The American Wing',
  AccessionYear: 1904,
  'Object Name': 'Vase',
  Title: 'The Adams Vase',
  Culture: 'American',
  Period: null,
  Dynasty: null,
  Reign: null,
  Portfolio: null,
  'Constituent ID': 108316253,
  'Artist Role': 'Designer|Manufacturer',
  'Artist Prefix': 'Designed by|Manufactured by',
  'Artist Display Name': 'Paulding Farnham|Tiffany & Co.',
  'Artist Display Bio': '1859–1927|1837–present',
  'Artist Suffix': ' | ',
  'Artist Alpha Sort': 'Farnham, Paulding|Tiffany & Co.',
  'Artist Nationality': 'American| ',
  'Artist Begin Date': '1859      |1837      ',
  'Artist End Date': '1927      |9999      ',
  'Artist Gender': '|',
  'Artist ULAN URL':
    'http://vocab.getty.edu/page/ulan/500336597|http://vocab.getty.edu/page/ulan/500330306',
  'Artist Wikidata URL':
    'https://www.wikidata.org/wiki/Q13476260|https://www.wikidata.org/wiki/Q1066858',
  'Object Date': '1893–95',
  'Object Begin Date': 1893,
  'Object End Date': 1895,
  Medium:
    'Gold, amethysts, spessartites, tourmalines, fresh water pearls, quartzes, rock crystal, and enamel',
  Dimensions:
    'Overall: 19 7/16 x 13 x 9 1/4 in. (49.4 x 33 x 23.5 cm); 352 oz. 18 dwt. (10977 g) Body: H. 18 7/8 in. (47.9 cm) Cover: 4 1/4 x 4 13/16 in. (10.8 x 12.2 cm); 19 oz. 6 dwt. (600.1 g)',
  'Credit Line': 'Gift of Edward D. Adams, 1904',
  'Geography Type': 'Made in',
  City: 'New York',
  State: null,
  County: null,
  Country: 'United States',
  Region: null,
  Subregion: null,
  Locale: null,
  Locus: null,
  Excavation: null,
  River: null,
  Classification: null,
  'Rights and Reproduction': null,
  'Link Resource': 'http://www.metmuseum.org/art/collection/search/35',
  'Object Wikidata URL': 'https://www.wikidata.org/wiki/Q83545838',
  'Metadata Date': null,
  Repository: 'Metropolitan Museum of Art, New York, NY',
  Tags: 'Animals|Garlands|Birds|Men',
  'Tags AAT URL':
    'http://vocab.getty.edu/page/aat/300249525|http://vocab.getty.edu/page/aat/300167386|http://vocab.getty.edu/page/aat/300266506|http://vocab.getty.edu/page/aat/300025928',
  'Tags Wikidata URL':
    'https://www.wikidata.org/wiki/Q729|https://www.wikidata.org/wiki/Q756600|https://www.wikidata.org/wiki/Q5113|https://www.wikidata.org/wiki/Q8441',
};

describe('transformDoc', () => {
  it('should transform MetDocument into ArtworkDocument', async () => {
    const esDoc = await ingester.transform(mockMetDocument) as ArtworkDocument;

    expect(esDoc.source).toBe('The Met');
    expect(esDoc.id).toBe('35');
    expect(esDoc.title).toBe('The Adams Vase');
    expect(esDoc.dimensions).toContain('19 7/16 x 13 x 9 1/4 in.');
    expect(esDoc.highlight).toBe(true);
    expect(esDoc.keywords).toBeDefined();
    expect(esDoc.keywords?.length).toBe(4);
    expect(esDoc.primaryConstituent?.name).toBe('Paulding Farnham');
  });
});
