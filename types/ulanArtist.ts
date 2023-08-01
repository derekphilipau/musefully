export interface UlanArtist {
  id: string;
  type?: string;
  preferredTerm?: string;
  normalizedPreferredTerm?: string;
  nonPreferredTerms?: string[] | null;
  normalizedNonPreferredTerms?: string[];
  normalizedTermWords?: string[];
  descriptiveNotes?: string | null;
  biography?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  sex?: string | null;
}
