import * as T from '@elastic/elasticsearch/lib/api/types';

export const index: T.IndicesIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 1,
};

export const unaggregatedStandardAnalyzer: T.AnalysisAnalyzer = {
  type: 'custom',
  tokenizer: 'standard',
  char_filter: ['hyphenApostropheMappingFilter'],
  filter: ['lowercase', 'asciifolding', 'enSnowball'],
};

export const aggregatedKeywordAnalyzer: T.AnalysisAnalyzer = {
  type: 'custom',
  tokenizer: 'keyword',
  char_filter: ['hyphenApostropheMappingFilter'],
  filter: ['lowercase', 'asciifolding'],
};

export const suggestAnalyzer: T.AnalysisAnalyzer = {
  type: 'custom',
  tokenizer: 'standard',
  char_filter: ['hyphenApostropheMappingFilter'],
  filter: ['lowercase', 'asciifolding'],
};

export const analysis: T.IndicesIndexSettingsAnalysis = {
  analyzer: {
    unaggregatedStandardAnalyzer,
    aggregatedKeywordAnalyzer,
    suggestAnalyzer,
  },
  char_filter: {
    hyphenApostropheMappingFilter: {
      type: 'mapping',
      mappings: ['-=>\\u0020', "'=>", '’=>'],
    },
    /*
    // Currently unused.  An attempt to improve search results for names by
    // removing articles like "de la".
    articleCharFilter: { // T.AnalysisPatternReplaceCharFilter
      type: 'pattern_replace',
      pattern:
        "(^[Ddol]') |(^(van der|van|de la|de|du|da|di|le|la) )|( [dol]')",
      replacement: ' ',
    },
    */
  },
  filter: {
    enSnowball: {
      type: 'snowball',
      language: 'English',
    },
  },
};

export const keywordField: T.MappingProperty = { type: 'keyword' };
export const textField: T.MappingProperty = { type: 'text' };
export const objectField: T.MappingProperty = { type: 'object' };
export const disabledObjectField: T.MappingProperty = {
  type: 'object',
  enabled: false,
};
export const booleanField: T.MappingProperty = { type: 'boolean' };
export const shortField: T.MappingProperty = { type: 'short' };
export const integerField: T.MappingProperty = { type: 'integer' };
export const dateField: T.MappingProperty = { type: 'date' };
export const nestedField: T.MappingProperty = { type: 'nested' };

export const unaggregatedStandardAnalyzerTextField: T.MappingProperty = {
  type: 'text',
  analyzer: 'unaggregatedStandardAnalyzer',
};

export const searchableAggregatedKeywordAnalyzerField: T.MappingProperty = {
  type: 'keyword',
  fields: {
    search: {
      type: 'text',
      analyzer: 'unaggregatedStandardAnalyzer',
    },
  },
};

export const suggestUnaggregatedStandardAnalyzerField: T.MappingProperty = {
  type: 'keyword',
  fields: {
    search: {
      type: 'text',
      analyzer: 'unaggregatedStandardAnalyzer',
    },
    suggest: {
      type: 'search_as_you_type',
      analyzer: 'suggestAnalyzer',
    },
  },
};

export const constituentObjectField: T.MappingProperty = {
  properties: {
    id: keywordField,
    name: keywordField,
    canonicalName: searchableAggregatedKeywordAnalyzerField,
    prefix: keywordField,
    suffix: keywordField,
    dates: textField,
    birthYear: integerField,
    deathYear: integerField,
    nationality: keywordField,
    gender: keywordField,
    role: keywordField,
    rank: integerField,
    source: keywordField,
    sourceId: keywordField,
    wikiQid: keywordField,
    ulan: disabledObjectField,
  },
};

export const geographicalLocationObjectField: T.MappingProperty = {
  properties: {
    id: keywordField,
    name: searchableAggregatedKeywordAnalyzerField,
    continent: searchableAggregatedKeywordAnalyzerField,
    country: searchableAggregatedKeywordAnalyzerField,
    type: keywordField,
  },
};

export const museumLocationObjectField: T.MappingProperty = {
  properties: {
    id: keywordField,
    name: searchableAggregatedKeywordAnalyzerField,
    isPublic: booleanField,
    isFloor: booleanField,
    parentId: keywordField,
  },
};

export const imageObjectField: T.MappingProperty = {
  properties: {
    id: keywordField,
    url: keywordField,
    thumbnailUrl: keywordField,
    alt: textField,
    dominantColors: {
      type: 'nested',
      properties: {
        l: shortField, // lightness and always varies from 0 to 100
        a: shortField, // a* represents from green (-128) to red (+127)
        b: shortField, // b* from blue (-128) to yellow (+127)
        hex: keywordField, // Hexadecimal string without #
        percent: shortField, // 0-100%
      },
    },
    date: textField,
    view: keywordField,
    rank: integerField,
  },
};

export const simpleImageObjectField: T.MappingProperty = {
  properties: {
    id: keywordField,
    url: keywordField,
    thumbnailUrl: keywordField,
    alt: textField,
    date: textField,
    view: keywordField,
    rank: integerField,
  },
};
