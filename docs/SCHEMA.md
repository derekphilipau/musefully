# Datasets, Vocabularies & Schema

## Datasets

### Collections Data

Data has been collected from a number of sources, and more sources will be added over time:

- [Brooklyn Museum](https://www.brooklynmuseum.org): via [Brooklyn Museum Open API](https://www.brooklynmuseum.org/opencollection/api/docs).
- [MoMA](https://www.moma.org/): [Github dataset](https://github.com/MuseumofModernArt/collection).
- [The Met](https://www.metmuseum.org/): [Github dataset](https://github.com/metmuseum/openaccess).
- [Cleveland Museum of Art](https://www.clevelandart.org/): [Github dataset](https://github.com/ClevelandMuseumArt/openaccess).
- [Whitney Museum of American Art](https://whitney.org/): [Github dataset](https://github.com/whitneymuseum/open-access). (No Images)

### RSS Feeds

- [Hyperallergic](https://hyperallergic.com/): [Feed](https://hyperallergic.com/feed/)
- [MOMA](https://stories.moma.org/): [Feed](https://stories.moma.org/feed)
- [Cooper Hewitt](https://www.cooperhewitt.org/blog/): [Feed](https://www.cooperhewitt.org/blog/feed/)
- [Victoria & Albert Museum](https://www.vam.ac.uk/blog): [Feed](https://www.vam.ac.uk/blog/feed)
- [Seattle Art Museum](https://samblog.seattleartmuseum.org/): [Feed](https://samblog.seattleartmuseum.org/feed/)
- [Milwaukee Art Museum](https://blog.mam.org/): [Feed](https://blog.mam.org/feed/)
- [ArtNews](https://www.artnews.com/): [Feed](https://www.artnews.com/feed/)
- [NYT Art & Design](https://nytimes.com): [Feed](https://rss.nytimes.com/services/xml/rss/nyt/ArtandDesign.xml)
- [The Met](https://www.metmuseum.org): [Feed](https://www.metmuseum.org/blogs?rss=1)
- [Artsy](https://www.artsy.net): [Feed](https://www.artsy.net/rss/news)
- [Collossal](https://www.thisiscolossal.com): [Feed](https://www.thisiscolossal.com/feed/)
- [Hi-Fructose](https://hifructose.com): [Feed](https://hifructose.com/feed/)
- [Juxtapoz](https://www.juxtapoz.com): [Feed](https://www.juxtapoz.com/news/?format=feed&type=rss)
- [Artforum](https://www.artforum.com): [Feed](https://www.artforum.com/rss.xml)
- [LACMA](https://www.lacma.org): [Feed](https://www.lacma.org/rss.xml)
- [Aesthetica](https://aestheticamagazine.com): [Feed](https://aestheticamagazine.com/feed/)
- [New Yorker Daily Cartoon](https://www.newyorker.com): [Feed](https://www.newyorker.com/feed/cartoons/daily-cartoon)

### Additional Metadata

It's often necessary to augment backend collection data with additional metadata. For example, theme tags like "Climate Justice" might be associated with artworks in a CMS rather the backend collections management system. The "sortPriority" field allows one to prominently display specific documents by adjusting the ordering in default searches. This additional metadata is stored in `data/BrooklynMuseum/additionalMetadata.jsonl`, but could just as easily be exported from a CMS.

### Getty Union List of Artist Names (ULAN) Data

ULAN XML was downloaded from [Getty's website](http://ulandownloads.getty.edu/) and converted to JSON using the `ulanXmlToJsonConvert.ts` script. When updating the `terms` index, the script attempts to find a matching artist name from this JSON file. If found, the ULAN artist data is added to the terms index document.

## Elasticsearch Indices

### Elasticsearch DSL

This project uses Elasticsearch [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) with the Elasticsearch [Javascript Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html) to manage indices and query data.

### Elasticsearch Field Types

Basic Elasticsearch index, field types, analyzers, and filters are defined in `util/elasticsearch/settings.ts`.

### Index Definition

Adjust number_of_shards and number_of_replicas for your use case.

#### Analyzers & Filters

[Mapping Character Filters](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-mapping-charfilter.html):

- `hyphenApostropheMappingFilter` - replaces hyphens with spaces and removes single quotes.
- `articleCharFilter` - UNUSED - replaces common articles (de, van, der, etc.) with spaces. Originally intended to help with searching names containing many articles.

[Filters](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-tokenfilters.html):

- `enSnowball` - stems words using a [Snowball-generated stemmer](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-snowball-tokenfilter.html) for English language

[Analyzers](https://www.elastic.co/guide/en/elasticsearch/reference/current/analyzer.html):

- `unaggregatedStandardAnalyzer` - For common text fields that are not aggregated.
- `aggregatedKeywordAnalyzer` - For aggregated keyword fields
- `suggestAnalyzer` - For search_as_you_type fields

#### Field definitions

Most definitions are straight-forward. Some search and suggest fields contain subfields "search" and "suggest" used for those use-cases.

### Elasticsearch Indices

Indices are defined in `/util/elasticsearch/indices.ts`.

### Re-used Object Fields

Some object fields are re-used across multiple indices.

Constituent:

- `id` - Source-dependent ID of the constituent
- `name` - Name of the constituent, e.g. "Pablo Picasso"
- `dates` - A free-form string representing the dates of a constituent, often the birth & death of an artist, e.g. "ca. 1483–1556"
- `birthYear` - Birth year of the constituent
- `deathYear` - Death year of the constituent
- `nationality` - Array of nationalities of the constituent
- `gender` - Gender. Note that ULAN seems to only record 'Male', 'Female', and 'N/A'
- `role` - Role of the constituent, e.g. "Artist", "Maker", "Photographer", etc.
- `source` - Source of the constituent, e.g. "Brooklyn Museum", "Getty ULAN"
- `sourceId` - Source-dependent ID of the constituent
- `wikiQid` - Wikidata QID of the constituent
- `ulan` - ULAN record for the constituent

Geographical Location:

- `id` - Source-dependent ID of the location
- `name` - Name of the location, e.g. "New York, New York, United States"
- `continent` - Continent of the location, e.g. "North America"
- `country` - Country of the location, e.g. "United States"
- `type` - Type of location, e.g. "City", "State", "Country", etc.

Image:

- `url` - The URL of the image
- `thumbnailUrl` - The URL of the thumbnail
- `alt` - The alt text for the image
- `dominantColors` - An array of arrays of HSL colors and other information used for color search
- `year` - The year of the image
- `view` - The view of the image, e.g. "front", "back", "detail", etc.
- `rank` - The rank of the image, used for sorting
- `embedding` - Experimental Feature. CLIP image embedding for similarity & text search. Removed. [See examples here.](./doc/embeddings.md)

Museum Location:

- `id` - Source-dependent ID of the location
- `name` - Name of the location, e.g. ""
- `isPublic` - Whether the location is public
- `isFloor` - Whether the location is a floor
- `parentId` - The ID of the parent location

#### Base Document

The base document defines common fields for all indices, these are the fields used for cross-index search. The Elasticsearch Base Document fields are defined in `indices.ts` and the associated Typescript interface is defined in `/types/document.ts`.

- `type` - The type of document, e.g. "object", "terms"
- `source` - The source of the document, e.g. "Brooklyn Museum", "Getty ULAN"
- `url` - The URL of the document
- `id` - The unique ID of the document
- `title` - The title of the document
- `description` - The description of the document
- `searchText` - The text used for full-text search. This can be configured on a per-index basis to allow global search to include special fields like accession number.
- `keywords` - An array of keywords for the document
- `boostedKeywords` - An array of keywords that should be boosted in search results
- `primaryConstituent` - The primary constituent of the document, e.g. the artist of a painting.
- `image` - Image. The main image of the document
- `date` - Date the document was created, not currently used.
- `formattedDate` - A string representing the date, no strict format.
- `startYear` - An integer representing the start date year. Used for year range filtering.
- `endYear` - An integer representing the end date year. Used for year range filtering.
- `sortPriority` - Integer representing the priority or weight of a document. Allows for default search results customization.

Note on dates: Museum objects have a wide range of dates from pre-historic BCE to contemporary CE that ISO 8601 cannot represent, hence the use of signed integers to represent years.

#### Collection Document

Includes all Base Document fields as well as:

- `constituents` - Constituent array. Entities associated with the document, e.g. artists, photographers, organization, etc.
- `images` - Image array. Images associated with the document.
- `accessionNumber` - The accession number.
- `accessionDate` - Free-form date field for accession date.
- `period` - The period, e.g. "Edo Period", "Middle Kingdom", etc.
- `dynasty` - The dynasty, e.g. "Qing Dynasty", "Mughal", etc.
- `provenance` - Free-text field describing provenance.
- `medium` - The medium, e.g. "Oil on canvas", "Woodblock print", etc.
- `dimensions` - The dimensions, e.g. "Sheet: 14 1/2 x 10 1/4 in. (36.8 x 26 cm)" TODO: Normalize dimensions into standardized fields.
- `edition` - The edition, e.g. "Edition: 23/50"
- `portfolio` - The portfolio, e.g. "Scenes from the Life of Saint Lawrence"
- `markings` - Markings on object, e.g. "Stamped on back: 'HERTER BRO'S.'"
- `signed` - Signature on object, e.g. "Kunichika ga 国周画"
- `inscribed` - Inscription on object
- `creditLine` - Credit line, e.g. "Dick S. Ramsay Fund"
- `copyright` - Copyright, e.g. "© Park McArthur"
- `classification` - Classification, e.g. "Print", "Sculpture", "Painting", etc.
- `publicAccess` - Boolean, if true is public access.
- `copyrightRestricted` - Boolean, if true images are restricted.
- `highlight` - Boolean whether or not object is highlighted. TODO: Remove, Brooklyn Museum-specific.
- `section` - Museum-specific gallery section, e.g. "Old Kingdom"
- `museumLocation` - Museum Location. Museum-specific location within museum
- `onView` - Whether or not the object is currently on view.
- `rightsType` - Specifies copyright type, e.g. "Creative Commons-BY"
- `labels` - Array of gallery labels. TODO: Define type & add to searchText?
- `departments` - An array of departments/collections the object belongs to.
- `exhibitions` - An array of exhibitions the object has been in. TODO: Assumes exhibitions have unique names.
- `geographicLocations` - Geographical Location array. Geographic locations associated with the object.
- `primaryGeographicalLocation` - Geographical Location. The primary location associated with the object.

#### Content Document

Content documents represent a web page or resource, typically from a museum's website. The fields are the same as Base Document.

#### Terms Document

Terms documents represent terms from a controlled vocabulary. These are queried for "did you mean?" searches. The fields are the same as Base Document with the addition of:

- `sourceId`: The ID of the term in the source vocabulary.
- `sourceType`: The type of the term within the source vocabulary.
- `index`: The index the term belongs to, e.g. "collections".
- `field`: The field the term belongs to, e.g. "classification", "primaryConstituent.canonicalName"
- `value`: The value of the term, e.g. "Painting", "Pablo Picasso", etc.
- `preferred`: The preferred term, e.g. "Pablo Picasso"
- `alternates`: An array of alternate terms, e.g. ["Picasso, Pablo", "Picasso", etc.]
- `summary`: A summary of the term. Deprecated, use data fields instead.
- `description`: A description of the term. Deprecated, use data fields instead.
- `data`: The raw data of the term, e.g. the JSON from the Getty ULAN.

### Elasticsearch Queries

##### Multi-match Search

Text queries are currently searched with multi_match default [`best_fields`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html). Fields can be weighted to give priority, in this case `boostedKeywords` is very heavily weighted for cases where you want a document to appear first if it contains an important keyword.

```
multi_match: {
    query: q,
    type: 'cross_fields',
    operator: 'and',
    fields: [
        'boostedKeywords^20',
        'primaryConstituent.canonicalName.search^4',
        'title.search^2',
        'keywords^2',
        'description',
        'searchText',
    ],
},
```

#### Collection Object Similarity

How one defines object similarity will vary from institution to institution. There are a number of approaches to querying Elasticsearch for similar documents, notably [`more_like_this`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-mlt-query.html).

This project uses a custom bool query of boosted should terms. [similarObjects.ts](./util/elasticsearch/search/similarObjects.ts) specifies which fields are used along with a boost value for each. The primary constituent (e.g. Artist, Maker, etc.) is given the most weight. These fields can be adjusted based on your institution's concept of object similarity. The current weights are:

- `primaryConstituent.canonicalName.search` - 6
- `dynasty` - 2
- `period` - 2
- `classification` - 1.5
- `medium` - 1
- `departments` - 1
- `exhibitions` - 1
- `primaryGeographicalLocation.name` - 1
