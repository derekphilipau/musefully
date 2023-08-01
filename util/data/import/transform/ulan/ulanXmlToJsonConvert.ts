/**
 * 
 * For use with http://ulandownloads.getty.edu/ ULAN XML files.
 * 
 * This script transforms the ULAN XML files into a JSONL file with simplified objects represenitng ULAN terms.
 * 
 * No need to run this script if the data/ULAN/json/ulanArtists.jsonl exists and the ULAN XML files have not changed.
 * 
 */
import * as fs from 'fs';
import * as readline from 'node:readline';
import * as xml2js from 'xml2js';

const ulanArtistsFile = './data/ULAN/json/ulanArtists.jsonl.gz';
const ulanCorporateBodiesFile = './data/ULAN/json/ulanCorporateBodies.jsonl.gz';
const ulanRawFilenames = [
  './data/ULAN/raw/ulan_xml_0622/ULAN1.xml',
  './data/ULAN/raw/ulan_xml_0622/ULAN2.xml',
  './data/ULAN/raw/ulan_xml_0622/ULAN3.xml',
  './data/ULAN/raw/ulan_xml_0622/ULAN4.xml',
  './data/ULAN/raw/ulan_xml_0622/ULAN5.xml',
];

const parser = new xml2js.Parser();

export interface UlanTerm {
  id: string;
  type: string;
  preferredTerm?: string | null;
  nonPreferredTerms?: string[] | null;
  descriptiveNotes?: string | null;
  biography?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  sex?: string | null;
}

function transformSubject(ulan): UlanTerm | undefined {
  const subject = ulan?.Subject;
  const id = subject?.['$']?.Subject_ID;
  if (!subject || !id) return;

  let type =
    subject?.Parent_Relationships?.[0]?.Preferred_Parent?.[0]
      ?.Parent_String?.[0];
  if (type) {
    // Type is of form "Corporate Bodies [500000003]"
    type = type.replace(/\s\[\d+\]$/, '');
  }

  let descriptiveNotes: string | null = null;
  if (subject?.Descriptive_Notes?.length > 0) {
    for (const notes of subject.Descriptive_Notes) {
      const language = notes?.Descriptive_Note?.[0].Note_Language?.[0];
      const text = notes?.Descriptive_Note?.[0].Note_Text?.[0];
      if (language === 'English' && text) {
        descriptiveNotes = text;
        break;
      }
    }
  }

  let preferredTerm: string | null = null;
  let nonPreferredTerms: string[] | null = null;
  if (subject?.Terms[0]) {
    if (subject.Terms[0]?.Preferred_Term?.[0]) {
      preferredTerm = subject.Terms[0].Preferred_Term[0]?.Term_Text?.[0];
    }
    if (subject.Terms[0]?.['Non-Preferred_Term']?.length > 0) {
      for (const term of subject.Terms[0]['Non-Preferred_Term']) {
        if (term?.Term_Text[0]) {
          if (!nonPreferredTerms) nonPreferredTerms = [];
          nonPreferredTerms.push(term.Term_Text[0]);
        }
      }
    }
  }

  if (preferredTerm === null) return;
  if (nonPreferredTerms?.length === 0) nonPreferredTerms = null;

  const ulanTerm: UlanTerm = {
    id,
    type,
    preferredTerm,
    nonPreferredTerms,
    descriptiveNotes,
  }

  if (subject?.Biographies?.[0]?.Preferred_Biography?.length > 0) {
    const xmlBio = subject.Biographies[0].Preferred_Biography[0];
    ulanTerm.biography = xmlBio?.Biography_Text?.[0] ? xmlBio.Biography_Text[0] : null;
    ulanTerm.birthDate = xmlBio?.Birth_Date?.[0] ? xmlBio.Birth_Date[0] : null;
    ulanTerm.deathDate = xmlBio?.Death_Date?.[0] ? xmlBio.Death_Date[0] : null;
    ulanTerm.sex = xmlBio?.Sex?.[0] ? xmlBio.Sex[0] : null;
  }  

  return ulanTerm;
}

async function writeJsonSubject(xmlSubject: string) {
  const subject = await parser.parseStringPromise(xmlSubject);
  const esObj = transformSubject(subject);
  if (esObj?.type === 'Persons, Artists') {
    fs.writeFileSync(ulanArtistsFile, JSON.stringify(esObj) + '\n', {
      flag: 'a',
    });
  } else if (esObj?.type === 'Corporate Bodies') {
    fs.writeFileSync(ulanCorporateBodiesFile, JSON.stringify(esObj) + '\n', {
      flag: 'a',
    });
  }
}

async function parseULANXMLFile(filename: string) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  let xmlSubject: string = '';
  for await (const line of rl) {
    if (line.match(/<Subject Subject_ID="(\d+)">/)) {
      xmlSubject = line + '\n';
    } else if (xmlSubject && line) {
      if (line.match(/<\/Subject>/)) {
        xmlSubject += line + '\n';
        await writeJsonSubject(xmlSubject);
        xmlSubject = '';
      } else if (line.match(/<Parent_String>.*<\/Parent_String>/)) {
        if (
          line.match(
            /<Parent_String>Persons, Artists \[500000002\]<\/Parent_String>/
          ) ||
          line.match(
            /<Parent_String>Corporate Bodies \[500000003\]<\/Parent_String>/
          )
        ) {
          xmlSubject += line + '\n';
        } else {
          xmlSubject = '';
        }
      } else {
        xmlSubject += line + '\n';
      }
    }
  }
}

export async function ulanXmlToJsonConvert() {
  fs.writeFileSync(ulanArtistsFile, '', { flag: 'w' });
  fs.writeFileSync(ulanCorporateBodiesFile, '', { flag: 'w' });
  for (const filename of ulanRawFilenames) {
    await parseULANXMLFile(filename);
  }
}
