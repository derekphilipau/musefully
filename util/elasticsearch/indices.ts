import * as T from '@elastic/elasticsearch/lib/api/types';

import * as S from './settings';

const baseDocument: Record<T.PropertyName, T.MappingProperty> = {
  type: S.keywordField,
  source: S.searchableAggregatedKeywordAnalyzerField,
  url: S.keywordField,
  id: S.keywordField,
  title: S.suggestUnaggregatedStandardAnalyzerField,
  description: S.unaggregatedStandardAnalyzerTextField,
  searchText: S.unaggregatedStandardAnalyzerTextField,
  keywords: S.unaggregatedStandardAnalyzerTextField,
  boostedKeywords: S.unaggregatedStandardAnalyzerTextField,
  primaryConstituent: S.constituentObjectField,
  image: S.imageObjectField,
  date: S.dateField,
  formattedDate: S.textField,
  startYear: S.integerField,
  endYear: S.integerField,
  sortPriority: S.integerField,
};

export const collections: T.IndicesIndexSettings = {
  settings: {
    index: S.index,
    analysis: S.analysis,
  },
  mappings: {
    properties: {
      ...baseDocument,
      constituents: S.constituentObjectField,
      images: S.simpleImageObjectField,
      accessionNumber: S.searchableAggregatedKeywordAnalyzerField,
      accessionDate: S.dateField,
      period: S.searchableAggregatedKeywordAnalyzerField,
      dynasty: S.searchableAggregatedKeywordAnalyzerField,
      provenance: S.unaggregatedStandardAnalyzerTextField,
      medium: S.searchableAggregatedKeywordAnalyzerField, // Array of each medium
      formattedMedium: S.unaggregatedStandardAnalyzerTextField, // Full medium
      dimensions: S.textField,
      edition: S.textField,
      portfolio: S.textField,
      markings: S.textField,
      signed: S.textField,
      inscribed: S.textField,
      creditLine: S.textField,
      copyright: S.textField,
      classification: S.searchableAggregatedKeywordAnalyzerField,
      publicAccess: S.booleanField,
      copyrightRestricted: S.booleanField,
      highlight: S.booleanField,
      section: S.searchableAggregatedKeywordAnalyzerField,
      museumLocation: S.museumLocationObjectField,
      onView: S.booleanField,
      rightsType: S.keywordField,
      labels: S.disabledObjectField,
      relatedObjects: S.keywordField,
      departments: S.searchableAggregatedKeywordAnalyzerField,
      exhibitions: S.searchableAggregatedKeywordAnalyzerField,
      primaryGeographicalLocation: S.geographicalLocationObjectField,
      geographicalLocations: S.geographicalLocationObjectField,
    },
  },
};

export const content: T.IndicesIndexSettings = {
  settings: {
    index: S.index,
    analysis: S.analysis,
  },
  mappings: {
    properties: {
      ...baseDocument,
    },
  },
};

export const terms: T.IndicesIndexSettings = {
  settings: {
    index: S.index,
    analysis: S.analysis,
  },
  mappings: {
    properties: {
      source: S.keywordField,
      index: S.keywordField,
      field: S.keywordField,
      value: S.suggestUnaggregatedStandardAnalyzerField,
      alternates: S.unaggregatedStandardAnalyzerTextField,
      summary: S.textField,
      data: S.disabledObjectField,
    },
  },
};
