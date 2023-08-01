import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import {
  getObjectUrlWithSlug,
  trimStringToLengthAtWordBoundary,
} from '@/util/various';

function getContainerClass(layout) {
  if (layout === 'grid') return '';
  return 'grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-x-6 gap-y-3';
}

function getDetailsClass(layout) {
  if (layout === 'grid') return '';
  return 'lg:col-span-2';
}

function getHsl(item) {
  if (!(item.image?.dominantColors?.length > 0)) return 'white';
  const hsl = `hsl(${item.image?.dominantColors[0].h}, ${item.image?.dominantColors[0].s}%, ${item.image?.dominantColors[0].l}%)`;
  return hsl;
}

function getFontColor(item) {
  if (!(item.image?.dominantColors?.length > 0)) return 'black';
  if (item.image?.dominantColors[0].l > 50) return 'black';
  return 'white';
}

export function ColorCard({ item, layout, showType }) {
  if (!item) return null;
  const dict = getDictionary();

  const primaryConstituentName = item.primaryConstituent?.name || 'Maker Unknown';

  const href = getObjectUrlWithSlug(item._id, item.title);

  return (
    <Link href={href}>
      <div className={getContainerClass(layout)}>
        <div>
          {showType && layout === 'grid' && (
            <h4 className="text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.collections.itemTitle']}
            </h4>
          )}
          {item.image?.dominantColors && (
            <div
              className="flex aspect-square items-center justify-center p-10 text-center text-2xl"
              style={{
                backgroundColor: getHsl(item),
                color: getFontColor(item),
              }}
            >
              {trimStringToLengthAtWordBoundary(item.title, 100)}
            </div>
          )}
        </div>
        <div className={getDetailsClass(layout)}>
          {showType && layout === 'list' && (
            <h4 className="mb-2 text-base font-semibold uppercase text-neutral-500 dark:text-neutral-600">
              {dict['index.collections.itemTitle']}
            </h4>
          )}

          {layout !== 'list' && (
            <h4 className="text-sm">
              {item.formattedDate ? `${item.formattedDate},` : ''}
              {primaryConstituentName}
            </h4>
          )}
          {layout === 'list' && (
            <>
              <h4 className="mb-2 text-xl font-semibold">
                {item.title}
                {item.formattedDate ? `, ${item.formattedDate}` : ''}
              </h4>
              <p>{trimStringToLengthAtWordBoundary(item.description, 200)}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
