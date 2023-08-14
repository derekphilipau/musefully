import { getClient } from '@/util/elasticsearch/client';
import { bulk, getBulkOperationArray } from '@/util/elasticsearch/import';
import { searchAll } from '@/util/elasticsearch/search/search';
import dominantColors from '@/util/image/dominantColors';

const INDEX_NAME = 'art';
const NUMBER_DOMINANT_COLORS = 8;

export async function updateDominantColors(forceUpdate: boolean = false) {
  const bulkLimit = parseInt(process.env.ELASTICSEARCH_BULK_LIMIT || '1000');
  const maxBulkOperations = bulkLimit * 2;
  const client = getClient();
  let hits: any[] = [];

  if (forceUpdate) {
    // Get all documents with images, regardless of whether we've already processed them
    hits = await searchAll(
      INDEX_NAME,
      { exists: { field: 'image.thumbnailUrl' } },
      ['image']
    );
  } else {
    // Get all documents with images that we haven't processed yet
    hits = await searchAll(
      INDEX_NAME,
      {
        bool: {
          must: [
            {
              exists: { field: 'image.thumbnailUrl' },
            },
          ],
          must_not: [
            {
              nested: {
                path: 'image.dominantColors',
                query: {
                  bool: {
                    must: [
                      {
                        exists: {
                          field: 'image.dominantColors',
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      ['image']
    );
  }

  console.log(
    `Dominant Colors: Found ${hits.length} documents with images to analyze.`,
    `Update with force equal to ${forceUpdate}, max operations ${maxBulkOperations}.`
  );

  let operations: any[] = [];
  for (const hit of hits) {
    const document = hit._source;
    if (!document.image?.thumbnailUrl) continue;
    const palette = await dominantColors(
      document.image.thumbnailUrl,
      NUMBER_DOMINANT_COLORS
    );
    console.log(
      `doc id ${hit._id} image ${document.image.thumbnailUrl} has ${palette.length} colors`
    );

    const colors: any[] = [];
    for (const paletteColor of palette) {
      if (
        paletteColor.percent === 0 ||
        !paletteColor.lab.length ||
        paletteColor.lab[0] == null ||
        paletteColor.lab[1] == null ||
        paletteColor.lab[2] == null
      ) {
        continue;
      }
      colors.push({
        l: paletteColor.lab[0],
        a: paletteColor.lab[1],
        b: paletteColor.lab[2],
        hex: paletteColor.hex,
        percent: Math.round(paletteColor.percent * 100), // Convert to int, 0.51 -> 51
      });
    }
    if (colors.length > 0) {
      document.image.dominantColors = colors;
    }

    operations.push(...getBulkOperationArray('update', INDEX_NAME, hit._id, document));

    if (operations.length >= maxBulkOperations) {
      console.log('BULK UPDATE');
      await bulk(client, operations);
      operations = [];
    }
  }

  if (operations.length > 0) {
    console.log('BULK UPDATE');
    await bulk(client, operations);
  }
}
