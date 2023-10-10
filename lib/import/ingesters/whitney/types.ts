// {"ConstituentID":"5","DisplayName":"Per Arnoldi","ArtistBio":"Danish, born 1941","Nationality":"Danish","Gender":"Male","BeginDate":"1941","EndDate":"","Wiki QID":"","ULAN":""}
export interface WhitneyArtist {
  id: number;
  display_name: string;
  birth_date: number;
  death_date: number;
}

export interface WhitneyDocument {
  id: number;
  title: string;
  display_date: string;
  classification: string;
  medium: string;
  accession_number: string;
  dimensions: string;
  publication_info: string;
  edition: string;
  credit_line: string;
  credit_line_repro: string;
  artists: string; // assuming it can be a comma-separated list of multiple artists
  artist_ids: string; // assuming it can be a comma-separated list of multiple artist IDs
};
