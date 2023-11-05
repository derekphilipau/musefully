import type { Key } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { TermDocument } from '@/types/document';
import { TermCard } from '../search-card/term-card';

interface SearchDidYouMeanProps {
  terms: TermDocument[];
}

export function SearchDidYouMean({ terms }: SearchDidYouMeanProps) {
  const dict = getDictionary();

  if (!terms?.length) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-2 mt-4 text-lg text-neutral-900 dark:text-white">
        {dict['search.didYouMean']}
      </h4>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:pb-6 lg:grid-cols-4">
        {terms?.length > 0 &&
          terms.map(
            (term: TermDocument, i: Key) => term && <TermCard key={i} term={term} />
          )}
      </div>
    </div>
  );
}
