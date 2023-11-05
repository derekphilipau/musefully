'use client';

import { useEffect, useState } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { ArtworkDocument } from '@/types/document';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ArtworkDescriptionProps {
  item: ArtworkDocument;
}

export function ArtworkShare({
  item,
}: ArtworkDescriptionProps) {
  const dict = getDictionary();
  const [facebookLink, setFacebookLink] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [mailLink, setMailLink] = useState('');

  useEffect(() => {
    const encodedUrl = encodeURI(window.location.href);
    const encodedTitle = item?.title
      ? encodeURIComponent(item.title)
      : encodedUrl;

    setMailLink(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`);
    setFacebookLink(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    );
    setTwitterLink(
      `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    );
  }, [item]);

  function print() {
    window.print();
  }

  if (!item?.id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: 'outline' }) + ' print:hidden'}
      >
        <Icons.share2 className="mr-2 h-5 w-5" />
        {dict['button.share']}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="print:hidden">
        <DropdownMenuLabel>{dict['button.shareTo']}</DropdownMenuLabel>
        <DropdownMenuItem>
          <a href={mailLink} target="_blank" className="flex items-center">
            <Icons.mail className="mr-2 h-5 w-5" /> Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href={facebookLink} target="_blank" className="flex items-center">
            <Icons.facebook className="mr-2 h-5 w-5" /> Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href={twitterLink} target="_blank" className="flex items-center">
            <Icons.twitter className="mr-2 h-5 w-5" /> Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => print()}>
          <Icons.printer className="mr-2 h-5 w-5" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
