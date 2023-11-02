import {
  getArtworkUrlWithSlug,
  getBooleanValue,
  getCaption,
  snooze,
  stripHtmlTags,
  stripLineBreaks,
  timeAgo,
  trimStringToLengthAtWordBoundary,
  truncate,
} from '@/lib/various';

describe('stripHtmlTags', () => {
  it('should strip HTML tags from a string', () => {
    expect(stripHtmlTags('<p>Hello, <strong>World</strong>!</p>')).toBe(
      'Hello, World!'
    );
  });
  it('should return an empty string if input is falsy', () => {
    expect(stripHtmlTags('')).toBe('');
    expect(stripHtmlTags(null)).toBe('');
    expect(stripHtmlTags(undefined)).toBe('');
  });
});

describe('stripLineBreaks', () => {
  it('should strip line breaks from a string', () => {
    expect(stripLineBreaks('Hello\nWorld')).toBe('Hello World');
  });
  it('should replace line breaks with provided string', () => {
    expect(stripLineBreaks('Hello\nWorld', '-')).toBe('Hello-World');
  });
});

describe('getCaption', () => {
  it('should generate a caption for an artwork', () => {
    const artwork = {
      primaryConstituent: {
        name: 'Artist Name',
        canonicalName: 'Artist Name',
      },
      title: 'Artwork Title',
      formattedDate: '2023',
      formattedMedium: 'Oil on Canvas',
      dimensions: '100x100cm',
      creditLine: 'Gifted by Someone',
      accessionNumber: '12345',
      copyright: '© Artist',
      rightsType: 'All rights reserved',
      source: 'museum.jpg',
    } as any;
    const caption = getCaption(artwork, 'museum.jpg');
    expect(caption).toBe(
      'Artist Name. Artwork Title, 2023. Oil on Canvas, 100x100cm. Gifted by Someone, 12345. © Artist All rights reserved.'
    );
  });
});

describe('getBooleanValue', () => {
  it('should return true for true boolean values', () => {
    expect(getBooleanValue(true)).toBe(true);
    expect(getBooleanValue('true')).toBe(true);
    expect(getBooleanValue('1')).toBe(true);
    expect(getBooleanValue(1)).toBe(true);
  });
  it('should return false for false boolean values', () => {
    expect(getBooleanValue(false)).toBe(false);
    expect(getBooleanValue('false')).toBe(false);
    expect(getBooleanValue('0')).toBe(false);
    expect(getBooleanValue(0)).toBe(false);
    expect(getBooleanValue(null)).toBe(false);
    expect(getBooleanValue(undefined)).toBe(false);
  });
});

describe('trimStringToLengthAtWordBoundary', () => {
  it('should trim a string to the specified length at a word boundary', () => {
    expect(trimStringToLengthAtWordBoundary('This is a test string', 10)).toBe(
      'This is a...'
    );
  });
  it('should return the original string if it is shorter than the specified length', () => {
    expect(trimStringToLengthAtWordBoundary('Short string', 20)).toBe(
      'Short string'
    );
  });
});

describe('timeAgo', () => {
  it('should return a time ago string', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
  });
});

describe('truncate', () => {
  it('should truncate a string to a specific length at word boundary', () => {
    expect(
      truncate('This is a long string that needs to be truncated', 20)
    ).toBe('This is a long...');
  });
  it('should return the original string if it is shorter than the max length', () => {
    expect(truncate('Short string', 20)).toBe('Short string');
  });
});

describe('snooze', () => {
  it('should resolve after the specified number of seconds', async () => {
    const startTime = Date.now();
    await snooze(1);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
  });
});

describe('artwork slugification', () => {
  it('should return correct slug for artwork', () => {
    const slug = getArtworkUrlWithSlug('moma_431532', 'Lena: 30, Mark :69');
    expect(slug).toBe('/art/moma_431532/lena-30-mark-69');
  });
  it('should return correct slug for artwork', () => {
    const slug = getArtworkUrlWithSlug('bkm_225053', 'Disease Thrower #18');
    expect(slug).toBe('/art/bkm_225053/disease-thrower-18');
  });
});
