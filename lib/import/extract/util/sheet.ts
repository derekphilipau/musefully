import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';

export async function getUrlsFromSheet(sheet: GoogleSpreadsheetWorksheet) {
  await sheet.loadCells(`A2:A${sheet.rowCount}`);
  const urls: string[] = [];
  for (let i = 2; i < sheet.rowCount; i++) {
    const url = sheet.getCell(i, 0).value as string;
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

export async function getSpreadsheet(): Promise<GoogleSpreadsheet> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('No spreadsheet ID found.');
  }
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  await doc.loadInfo(); // loads document properties and worksheets
  console.log('Loaded spreadsheet: ' + doc.title);
  return doc;
}

export function getSheet(
  spreadsheet: GoogleSpreadsheet,
  sheetName: string
): GoogleSpreadsheetWorksheet {
  return spreadsheet.sheetsByTitle[sheetName];
}
