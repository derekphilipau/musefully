import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { Term } from '@/types/term';

interface ArtistTermCardProps {
  filters: Term[];
}

export function ArtistTermCard({ filters }: ArtistTermCardProps) {
  const dict = getDictionary();
  const term = filters.find(
    (term: Term) => term?.field === 'primaryConstituent.canonicalName'
  );

  if (!term) {
    return null;
  }

  const ulanLink = term.data?.id
    ? `https://www.getty.edu/vow/ULANFullDisplay?find=${term.data.id}&role=&nation=&subjectid=${term.data.id}`
    : null;

  return (
    <div className="mb-4">
      <h4 className="text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
        {dict[`field.primaryConstituent.canonicalName`]}
      </h4>
      {term.value && <h4 className="text-xl md:text-2xl">{term.value}</h4>}
      {term.data?.biography && (
        <p className="mb-4 text-neutral-700 dark:text-neutral-400">
          {term.data.biography}
        </p>
      )}
      {term.data?.descriptiveNotes && (
        <p className="">{term.data.descriptiveNotes}</p>
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
