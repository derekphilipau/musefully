import { createHash } from 'crypto';

const basicStopWords = [
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'if',
  'in',
  'into',
  'is',
  'it',
  'no',
  'not',
  'of',
  'on',
  'or',
  'such',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'will',
  'with',
];
const numbers = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'hudred',
];

const validTwoLetterWords = ['cd', 'lp', 'ev', 'pc', 'tv'];

/**
 * Get significant words from text
 * Especially for use with "medium" fields.
 * @param text
 * @returns
 */
export function parseSignificantWords(text: string | undefined): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(
      /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(-\w+)?/gi,
      ' '
    ) // remove hyphenated numbers
    .match(/[\p{L}\-]+/gu); // just get back words (no digits or punctuation);

  return Array.from(new Set(words)).filter((word) => {
    return (
      (word.length > 2 || validTwoLetterWords.includes(word)) &&
      !basicStopWords.includes(word) &&
      !numbers.includes(word)
    );
  });
}

/**
 * Used to ensure a value is a string, especially used for elasticsearch id fields.
 * @param val a number or string
 * @returns a string
 */
export function getStringValue(val: number | string): string {
  return val + '';
}

export function hashIdFormatter(
  val: string | number | undefined,
): string {
  if (val === undefined) throw new Error('ID cannot be created');
  return createHash('sha256')
    .update(val + '')
    .digest('hex');
}

export function urlIdFormatter(val: string | undefined): string {
  if (val === undefined) throw new Error('ID cannot be created');
  // Convert the value to a string, remove 'http://' or 'https://', and replace '/', '.', ':' with '-'
  let result = val.toString().replace(/^https?:\/\//, '').replace(/[\/.:]/g, '-');
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
}

export function sourceAwareIdFormatter(
  val: string | number | undefined,
  source: string,
  includeSourcePrefix = false
): string {
  if (val === undefined) throw new Error('ID cannot be created');
  if (includeSourcePrefix) return source + '_' + val;
  return val + '';
};
