'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/artworkDocument';
import { getCaption } from '@/lib/various';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-full-screen-local';
import { DocumentImage, getImageURL } from './document-image';

const OpenSeaDragonViewer = dynamic(() => import('./open-seadragon-viewer'), {
  ssr: false,
});

interface ImageZoomProps {
  item: ArtworkDocument;
}

export function ImageZoom({ item }: ImageZoomProps) {
  const dict = getDictionary();
  const [open, setOpen] = useState(false);

  if (!item || !item._index || !item?._id) return null;

  const largeImageUrl = getImageURL(item._index, item._id, 'l', 'webp');

  return (
    <div className="flex flex-col items-center">
      {item?.image?.url && (
        <div className="relative">
          <div className="flex">
            {item?.image?.url && (
              <div
                className="min-w-0"
                style={{ flex: '0 0 100%' }}
                onClick={() => setOpen(true)}
              >
                <DocumentImage
                  item={item}
                  className="max-h-[32rem] cursor-pointer object-contain"
                  size="m"
                  caption={getCaption(item)}
                />
              </div>
            )}
          </div>
          <div className="mt-4 break-words text-xs text-neutral-500 dark:text-neutral-400">
            {item?.copyrightRestricted && (
              <p className="mt-4 text-xs italic text-neutral-500 dark:text-neutral-400">
                This image is presented as a &quot;thumbnail&quot; because it is
                protected by copyright. The museum respects the rights of
                artists who retain the copyright to their work.
              </p>
            )}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="h-full max-w-none p-0">
              <DialogHeader className="z-50 h-16 bg-white p-4 dark:bg-neutral-900 sm:p-4 sm:text-left">
                <DialogTitle className="mb-2 px-2 text-base font-semibold sm:px-0 sm:text-lg">
                  <span className="mr-3">{item.title}</span>
                  <Link
                    href={item?.image?.url}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                    })}
                    aria-label={dict['button.download']}
                  >
                    <Icons.download
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    {dict['button.download']}
                  </Link>
                </DialogTitle>
              </DialogHeader>
              {item?.image?.url && (
                <div className="h-full w-full overflow-y-scroll">
                  <OpenSeaDragonViewer image={largeImageUrl} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
