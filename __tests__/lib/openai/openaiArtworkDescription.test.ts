import { parseAltTextAndLongDescription } from '@/lib/openai/openaiArtworkDescription';

describe('parseAltTextAndLongDescription', () => {
  it('should correctly parse valid input', () => {
    const input = `Alt Text: Sample ALT text.\n\nLong Description: Sample LONG description.`;
    const result = parseAltTextAndLongDescription(input);
    expect(result).toEqual({
      altText: 'Sample ALT text.',
      longDescription: 'Sample LONG description.',
    });
  });

  it('should handle input with different casing', () => {
    const input = `alt text: Sample ALT text.\n\nlong description: Sample LONG description.`;
    const result = parseAltTextAndLongDescription(input);
    expect(result).toEqual({
      altText: 'Sample ALT text.',
      longDescription: 'Sample LONG description.',
    });
  });

  it('should return undefined for invalid input types', () => {
    const result = parseAltTextAndLongDescription('');
    expect(result).toBeUndefined();
  });

  it('should return undefined if input does not match the expected format', () => {
    const input = `This is not a valid format.`;
    const result = parseAltTextAndLongDescription(input);
    expect(result).toBeUndefined();
  });
});
