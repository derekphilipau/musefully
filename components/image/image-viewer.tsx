'use client';

import { Key, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import useEmblaCarousel from 'embla-carousel-react';

import { getCaption } from '@/lib/various';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-full-screen-local';

const OpenSeaDragonViewer = dynamic(() => import('./open-seadragon-viewer'), {
  ssr: false,
});

export function ImageViewer({ item }) {
  const dict = getDictionary();
  let images = item?.images;
  if (!images?.length && item?.image) {
    images = [item.image];
  }

  const [selectedImage, setSelectedImage] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedImage(images?.[embla.selectedScrollSnap()]);
  }, [embla, images]);

  useEffect(() => {
    if (!embla) return;
    embla.on('select', onSelect);
    onSelect();
  }, [embla, onSelect]);

  if (!item || !item?.id) return null;
  if (!images?.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center  text-neutral-500 dark:text-neutral-400">
        <Icons.imageOff className="h-24 w-24" />
        <div className="mt-2 font-semibold">
          {dict['search.imageUnavailable']}
        </div>
      </div>
    );
  }

  function getThumbnailClass(thumbnailUrl: string) {
    const base = 'flex w-16 items-center justify-center p-1 cursor-pointer';
    if (thumbnailUrl === selectedImage?.image?.thumbnailUrl)
      return `${base} border border-neutral-400`;
    return base;
  }

  function clickImage(index) {
    setSelectedImage(images?.[index]);
    if (!item?.copyrightRestricted) setOpen(true);
  }

  function clickThumbnail(index) {
    setSelectedImage(images?.[index]);
    if (!embla) return;
    embla.scrollTo(index);
  }

  return (
    <div className="flex flex-col items-center">
      {images?.length > 0 && (
        <div className="relative">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex">
              {images.map(
                (image, index) =>
                  image.url && (
                    <div
                      key={index}
                      className="embla__slide min-w-0"
                      style={{ flex: '0 0 100%' }}
                      onClick={() => clickImage(index)}
                    >
                      <div className="relative">
                        <div className="absolute right-0 top-0 hidden group-hover:block">
                          <Icons.expand className="h-5 w-5 fill-current" />
                        </div>
                        <figure key={index}>
                          <Image
                            src={image.thumbnailUrl}
                            className={
                              item.copyrightRestricted
                                ? 'max-h-96 object-contain'
                                : 'max-h-96 cursor-pointer object-contain'
                            }
                            alt=""
                            width={800}
                            height={800}
                          />
                        </figure>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
          <div className="mt-4 break-words text-xs text-neutral-500 dark:text-neutral-400">
            {getCaption(item, selectedImage?.url)}
            {item.copyrightRestricted && (
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
                    href={selectedImage?.url}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                    })}
                    aria-label="Download File"
                  >
                    <Icons.download
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    {dict['button.download']}
                  </Link>
                </DialogTitle>
              </DialogHeader>
              {selectedImage.url && (
                <div className="h-full w-full overflow-y-scroll">
                  <OpenSeaDragonViewer image={selectedImage.url} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
      {images.length > 1 && (
        <div className="my-6 flex flex-wrap justify-start gap-2">
          {images.map(
            (image, index: Key) =>
              image?.url && (
                <div
                  key={index}
                  className={getThumbnailClass(image.thumbnailUrl)}
                  onClick={() => clickThumbnail(index)}
                >
                  <figure key={index}>
                    <Image
                      src={image.thumbnailUrl}
                      className="max-h-16 object-contain"
                      alt=""
                      width={200}
                      height={200}
                    />
                    <figcaption></figcaption>
                  </figure>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
