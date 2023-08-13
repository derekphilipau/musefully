export interface MetDocument {
  "Object Number": string; // Accession Number
  "Is Highlight": string;
  "Is Timeline Work": string;
  "Is Public Domain": string;
  "Object ID": string;
  "Gallery Number": string;
  Department: string;
  AccessionYear: string;
  "Object Name": string;
  Title: string;
  Culture: string;
  Period: string;
  Dynasty: string;
  Reign: string;
  Portfolio: string;
  // Multiple artists are separated by "|" in each field: 
  // 16556616555,Maker|Maker," | ",Robert Peaston|William Peaston,"British, active 1756–66|British, active 1746–78"," | ","Peaston, Robert|Peaston, William",British|British,1756      |1746      ,1766      |1778      ,|,
  "Constituent ID": string;
  "Artist Role": string;
  "Artist Prefix": string;
  "Artist Display Name": string;
  "Artist Display Bio": string;
  "Artist Suffix": string;
  "Artist Alpha Sort": string;
  "Artist Nationality": string;
  "Artist Begin Date": string;
  "Artist End Date": string;
  "Artist Gender": string;
  "Artist ULAN URL": string;
  "Artist Wikidata URL": string;
  "Object Date": string; // Date range, formatted
  "Object Begin Date": string; // Year
  "Object End Date": string; // Year
  Medium: string;
  Dimensions: string;
  "Credit Line": string;
  "Geography Type": string;
  City: string;
  State: string;
  County: string;
  Country: string;
  Region: string;
  Subregion: string;
  Locale: string;
  Locus: string;
  Excavation: string;
  River: string;
  Classification: string;
  "Rights and Reproduction": string;
  "Link Resource": string;
  "Object Wikidata URL": string;
  "Metadata Date": string;
  Repository: string;
  // Multiple tags are separated by "|": "Eagles|Men|Profiles"
  Tags: string[];
  // URLS also separated by "|": http://vocab.getty.edu/page/aat/300250049|http://vocab.getty.edu/page/aat/300025928|http://vocab.getty.edu/page/aat/300123319
  "Tags AAT URL": string[];
  "Tags Wikidata URL": string[];
}
