import { siteConfig } from '@/config/site';
import { getSheet, getSpreadsheet, getUrlsFromSheet } from './util/sheet';

/**
 * Extract documents and update the indices.
 */
export default async function extractDocumentsToSheet() {
  if (siteConfig.extractors.length === 0) {
    console.log('No extractors defined in config.');
    return;
  }

  for (const extractorName of siteConfig.extractors) {
    try {
      const { extractor } = await import(`./${extractorName}`);

      console.log(`Extracting ${extractor.typeName} to Google spreadsheet.`);
      const spreadsheet = await getSpreadsheet();
      const sheet = getSheet(spreadsheet, extractor.typeName);
      const urls = await getUrlsFromSheet(sheet);
      const docs = await extractor.extract();
      const docsToInsert: any[] = [];
      for (const doc of docs) {
        if (!urls.includes(doc.url)) {
          docsToInsert.push(doc);
        }
      }
      if (docsToInsert.length > 0) {
        await sheet.addRows(docsToInsert);
        console.log(
          `Extracted ${docsToInsert.length} documents of type ${extractor.typeName} using ${extractorName}.`
        );
      }
    } catch (e) {
      console.error(`Error extracting using ${extractorName}: ${e}`);
      return;
    }
  }
}
