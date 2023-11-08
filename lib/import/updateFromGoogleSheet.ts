import { siteConfig } from '@/config/site';
import { getSheet, getSpreadsheet } from './extract/util/sheet';
import { GoogleSheetConfig } from '@/config/site';
import { Client } from '@elastic/elasticsearch';
import { getClient } from '@/lib/elasticsearch/client';
import { ingester } from './ingesters/sheet/googleSheetIngester';
import {
  bulk,
  createIndexIfNotExist,
  getBulkOperationArray,
} from '@/lib/elasticsearch/import';
import type { SheetRowData } from './ingesters/sheet/googleSheetIngester';

async function importGoogleSheet(
  client: Client,
  sheetConfig: GoogleSheetConfig
) {
  try {
    const spreadsheet = await getSpreadsheet();
    const sheet = getSheet(spreadsheet, sheetConfig.sheetName);

    const rows = await sheet.getRows<SheetRowData>();

    console.log(`Found ${rows.length} rows in ${sheetConfig.sheetName}`)
    let operations: any[] = [];

    for (const row of rows) {
      const doc = ingester.transform(row, sheetConfig.typeName);
      if (doc && doc.url) {
        const id = ingester.generateId(doc);
        operations.push(
          ...getBulkOperationArray('update', sheetConfig.indexName, id, doc)
        );
      }
    }
    if (operations.length > 0) {
      await createIndexIfNotExist(client, sheetConfig.indexName);
      await bulk(client, operations);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export default async function updateFromGoogleSheet() {
  console.log('Import Google sheets.');
  const client = getClient();

  if (siteConfig.googleSheets.length === 0) {
    console.log('No Google sheets defined.');
    return;
  }

  for (const sheetConfig of siteConfig.googleSheets) {
    try {
      if (!sheetConfig.sheetName || !sheetConfig.indexName)
        throw new Error('Google sheet missing sheetName or indexName');
      await importGoogleSheet(
        client,
        sheetConfig
      );
    } catch (e) {
      console.error(`Error updating RSS ${sheetConfig.sheetName}: ${e}`);
      return;
    }
  }
}
