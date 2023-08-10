// {"ConstituentID":"5","DisplayName":"Per Arnoldi","ArtistBio":"Danish, born 1941","Nationality":"Danish","Gender":"Male","BeginDate":"1941","EndDate":"","Wiki QID":"","ULAN":""}
export interface MomaArtist {
  ConstituentID: number;
  DisplayName?: string;
  ArtistBio?: string;
  Nationality?: string;
  Gender?: string;
  BeginDate?: number;
  EndDate?: number;
  "Wiki QID"?: string;
  ULAN?: string;
}

export interface MomaDocument {
  Title: string;
  // Artist info start
  Artist?: string[];
  ConstituentID?: number[];
  ArtistBio?: string[];
  Nationality?: string[];
  BeginDate?: number[];
  EndDate?: number[];
  Gender?: string[];
  // Artist info end
  Date?: string; // "1978-80", "c. 1960", "Before 1946"
  Medium?: string;
  // Dimensions start
  Dimensions?: string;
  "Depth (cm)"?: number;
  "Height (cm)"?: number;
  "Width (cm)"?: number;
  // Dimensions end
  CreditLine?: string;
  AccessionNumber?: string;
  Classification?: string;
  Department?: string;
  DateAcquired?: string; // "1995-10-24"
  Cataloged?: string; // "Y"/"N"
  ObjectID: number;
  URL?: string;
  ThumbnailURL?: string | null;
};