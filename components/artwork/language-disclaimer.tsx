'use client';

import * as React from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import ArtworkContactForm from '@/components/contact-form/artwork-contact-form';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function LanguageDisclaimer({ item, formId }) {
  const dict = getDictionary();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="mt-6 rounded-md bg-neutral-50 dark:bg-neutral-800">
      <div className="p-4 text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center">
          <div className="shrink-0">
            <Icons.info className="size-5" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm">
              {dict['artwork.languageDisclaimer.question']}
            </p>
            {!isOpen && (
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="sm"
                className="px-0 sm:p-3"
                aria-label={dict['artwork.languageDisclaimer.toggle']}
              >
                {dict['artwork.languageDisclaimer.contactUs']}
                <span className="sr-only">
                  {dict['artwork.languageDisclaimer.toggle']}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="p-4">
          <ArtworkContactForm item={item} formId={formId} />
        </div>
      )}
    </div>
  );
}
