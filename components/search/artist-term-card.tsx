import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { TermDocument } from '@/types/document';

interface ArtistTermCardProps {
  filters: TermDocument[];
}

function toUlanUrl(ulanIdOrUrl: string | undefined): string | null {
  if (!ulanIdOrUrl) return null;
  if (ulanIdOrUrl.startsWith('http')) return ulanIdOrUrl;
  return `https://www.getty.edu/vow/ULANFullDisplay?find=${ulanIdOrUrl}&role=&nation=&subjectid=${ulanIdOrUrl}`;
}

export function ArtistTermCard({ filters }: ArtistTermCardProps) {
  const dict = getDictionary();
  const term = filters.find(
    (term: TermDocument) => term?.field === 'primaryConstituent.canonicalName'
  );

  if (!term) {
    return null;
  }

  const ulanLink = toUlanUrl((term.data as any)?.id);

  return (
    <div className="mb-4">
      <h4 className="text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
        {dict[`field.primaryConstituent.canonicalName`]}
      </h4>
      {term.value && <h4 className="text-xl md:text-2xl">{term.value}</h4>}
      {(term.data as any)?.biography && (
        <p className="mb-4 text-neutral-700 dark:text-neutral-400">
          {(term.data as any).biography}
        </p>
      )}
      {(term.data as any)?.descriptiveNotes && (
        <p className="">{(term.data as any).descriptiveNotes}</p>
      )}
      {ulanLink && (
        <p className="mb-4 mt-2">
          <Link href={ulanLink} target="_blank" className="underline">
            View Getty ULAN Record
          </Link>
        </p>
      )}
    </div>
  );
}
