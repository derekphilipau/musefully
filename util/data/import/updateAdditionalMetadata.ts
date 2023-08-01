import { getClient } from '@/util/elasticsearch/client';
import { getReadlineInterface } from '@/util/elasticsearch/import';

export async function updateAdditionalMetadata(dataFilename: string) {
  const chunkSize = parseInt(process.env.ELASTICSEARCH_BULK_LIMIT || '1000');
  const client = getClient();
  const rl = getReadlineInterface(dataFilename);

  const operations: any[] = [];

  for await (const line of rl) {
    try {
      const document = line ? JSON.parse(line) : undefined;
      if (document !== undefined) {
        const { _id, _index, ...docUpdate } = document; // Extract id, index and the rest of the document
        operations.push(
          {
            update: {
              _index,
              _id,
            },
          },
          { doc: docUpdate, doc_as_upsert: true }
        );
      }
    } catch (err) {
      console.error(`Error parsing line ${line}: ${err}`);
    }
  }

  let chunkedOperations: any[] = [];
  for (let i = 0; i < operations.length; i += chunkSize) {
    chunkedOperations.push(operations.slice(i, i + chunkSize));
  }

  for (const chunk of chunkedOperations) {
    console.log('BULK UPDATE');
    const bulkResponse = await client.bulk({ refresh: true, operations: chunk });
    if (bulkResponse.errors) {
      console.log(JSON.stringify(bulkResponse, null, 2));
      throw new Error('Failed to bulk update documents');
    }
    console.log(`updated ${chunk?.length / 2} docs`);
  }
}
