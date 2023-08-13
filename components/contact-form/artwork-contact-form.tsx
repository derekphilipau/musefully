'use client';

import { getDictionary } from '@/dictionaries/dictionaries';
import { ValidationError, useForm } from '@formspree/react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function ArtworkContactForm({ item, formId }) {
  const dict = getDictionary();
  const [state, handleSubmit] = useForm(formId);

  if (state.succeeded) {
    return (
      <p>
        Thanks for your submission! We&apos;ll contact you as soon as we can.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" id="objectId" name="objectId" value={item?.id} />
      <input
        type="hidden"
        id="objectTitle"
        name="objectTitle"
        value={item?.title}
      />
      <div className="mb-6">
        {dict['artwork.contactForm.description']}{' '}
        <span className="inline-block italic">&quot;{item?.title}&quot;</span>
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className="mb-2" htmlFor="email">
          {dict['artwork.contactForm.email']}
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder={dict['artwork.contactForm.emailPlaceholder']}
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>
      <div className="mt-6 grid w-full max-w-sm items-center gap-1.5">
        <Label className="mb-2" htmlFor="message">
          {dict['artwork.contactForm.message']}
        </Label>
        <textarea
          className="flex h-20 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-50 dark:focus:ring-neutral-400 dark:focus:ring-offset-neutral-900"
          id="message"
          name="message"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>
      <div className="mt-6 grid w-full max-w-sm items-center gap-1.5">
        <Button
          type="submit"
          aria-label={dict['artwork.contactForm.submit']}
          disabled={state.submitting}
        >
          {dict['artwork.contactForm.submit']}
        </Button>
        <ValidationError errors={state.errors} />
      </div>
    </form>
  );
}
