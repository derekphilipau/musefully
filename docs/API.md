# API

API endpoints for search, document retrieval, and RSS feed updates. Next.js API Routes with Route Handlers located in `/app/api` directory.

[Search](#search)

- [GET `/api/search`](#apisearch): Search documents
- [GET `/api/search/document`](#apisearchdocument): Get a document
- [GET `/api/search/options`](#apisearchoptions): Get agg options
- [GET `/api/search/similar`](#apisearchsimilar): Get similar artworks
- [GET `/api/search/suggest`](#apisearchsuggest): Get term suggestions
- [GET `/api/search/terms`](#apisearchterms): Get terms

[Sync](#sync)

- [GET `/api/import/rss`](#apiimportrss): Import/upsert RSS feeds

## Search

### `/api/search`

**GET**: Execute a search on an Elasticsearch index

- **Summary**: Execute a search on an Elasticsearch index
- **Description**: Endpoint to execute a search on the provided Elasticsearch index based on the given parameters. Querystring parameters are the same as those for the Web UI:
  GET `http://localhost:3000/api/search?index=art&f=true&primaryConstituent.canonicalName=George%20Bradford%20Brainerd`

#### Parameters:

- **In**: query

  - **Name**: index
  - **Required**: true
  - **Description**: Name of the Elasticsearch index to search.
  - **Schema**:
    - **Type**: string

- **In**: query

  - **Name**: p
  - **Required**: false
  - **Description**: Page number.
  - **Schema**:
    - **Type**: integer

- **In**: query

  - **Name**: size
  - **Required**: false
  - **Description**: Page size.
  - **Schema**:
    - **Type**: integer

- **In**: query

  - **Name**: q
  - **Required**: false
  - **Description**: Query to search for.
  - **Schema**:
    - **Type**: string

- **In**: query

  - **Name**: sf
  - **Required**: false
  - **Description**: Sort field.
  - **Schema**:
    - **Type**: string

- **In**: query

  - **Name**: so
  - **Required**: false
  - **Description**: Sort order.
  - **Schema**:
    - **Type**: string
    - **Enum**:
      - asc
      - desc

- **In**: query
  - **Name**: color
  - **Required**: false
  - **Description**: Hex string representing the color to search for.
  - **Schema**:
    - **Type**: string

#### Responses:

**200**: Successfully executed search.

- **Content**: application/json
- **Schema**:
  - **Type**: array
  - **Items**:
    - **Type**: object

**500**: Internal server error.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: object

### `/api/search/document`

**GET**: Retrieve a specific document by its ID

- **Summary**: Retrieve a specific document by its ID
- **Description**: Endpoint to retrieve a document based on the provided index and ID.
- **Examples**:
  - GET `http://localhost:3000/api/search/document?index=art&id=[documentId]`
  - GET `http://localhost:3000/api/search/document?id=bkm_225001&index=art`

##### Parameters:

- **name**: index

  - **in**: query
  - **required**: true
  - **description**: The index in which the document is stored.
  - **schema**:
    - **type**: string

- **name**: id
  - **in**: query
  - **required**: true
  - **description**: The ID of the document to retrieve.
  - **schema**:
    - **type**: string

##### Responses:

**200**: Successfully retrieved document.

- **content**: application/json
- **schema**:
  - **type**: object
  - **properties**:
    - **anyFieldName**:
      - **type**: string
    - **anotherFieldName**:
      - **type**: number

**400**: Either 'id' or 'index' not provided.

- **content**: application/json
- **schema**:
  - **type**: object
  - **properties**:
    - **error**:
      - **type**: string

**500**: Internal server error.

- **content**: application/json
- **schema**:
  - **type**: object
  - **properties**:
    - **error**:
      - **type**: object

### `/api/search/options`

**GET**: Get Aggregation Options

- **Summary**: Get Aggregation Options
- **Description**: Retrieve aggregation options based on the provided index and field.

##### Parameters:

- **Name**: index

  - **In**: query
  - **Description**: Index to search on.
  - **Required**: true
  - **Schema**:
    - **Type**: string

- **Name**: field

  - **In**: query
  - **Description**: Field to aggregate on.
  - **Required**: true
  - **Schema**:
    - **Type**: string

- **Name**: q
  - **In**: query
  - **Description**: Optional query string to further filter the results.
  - **Required**: false
  - **Schema**:
    - **Type**: string

##### Responses:

**200**: Successful response containing a list of aggregation options.

- **Content**: application/json
- **Schema**:
  - **Type**: array
  - **Items**:
    - **$ref**: `#/components/schemas/AggOption`

**400**: Bad request, typically when "index" or "field" are not provided.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: string

**500**: Internal server error.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: string

### `/api/search/similar`

**GET**: Retrieve Similar Artworks by ID

- **Summary**: Retrieve Similar Artworks by ID
- **Description**: Endpoint to get similar artworks by a given ID. Optionally, filter results based on the presence of a photo.

##### Parameters:

- **In**: query

  - **Name**: id
  - **Required**: true
  - **Description**: The ID of the artwork.
  - **Schema**:
    - **Type**: string

- **In**: query
  - **Name**: hasPhoto
  - **Required**: false
  - **Description**: Flag to indicate if the artwork should have a photo.
  - **Schema**:
    - **Type**: boolean

##### Responses:

**200**: Successfully retrieved similar artworks.

- **Content**: application/json
- **Schema**:
  - **Type**: array
  - **Items**:
    - **Type**: object

**400**: Invalid ID or other bad request.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: string

**500**: Internal server error.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: object

### `/api/search/suggest`

**GET**: Get suggestions based on a query string

- **Summary**: Get suggestions based on a query string
- **Description**: Endpoint to fetch suggestions based on the provided query string.

##### Parameters:

- **In**: query
  - **Name**: q
  - **Required**: true
  - **Description**: The query string for which to fetch suggestions.
  - **Schema**:
    - **Type**: string

##### Responses:

**200**: Successfully retrieved suggestions.

- **Content**: application/json
- **Schema**:
  - **Type**: array
  - **Items**:
    - **Type**: object
    - _Placeholder for the structure of suggestions_

**500**: Internal server error.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: object

### `/api/search/terms`

**GET**: Get terms based on a query string

- **Summary**: Get terms based on a query string
- **Description**: Endpoint to fetch terms based on the provided query string.

#### Parameters:

- **In**: query
  - **Name**: q
  - **Required**: true
  - **Description**: The query string for which to fetch terms.
  - **Schema**:
    - **Type**: string

#### Responses:

**200**: Successfully retrieved terms.

- **Content**: application/json
- **Schema**:
  - **Type**: array
  - **Items**:
    - **Type**: object

**500**: Internal server error.

- **Content**: application/json
- **Schema**:
  - **Type**: object
  - **Properties**:
    - **Error**:
      - **Type**: object

## Sync

### `/api/import/rss`

**GET**: Updates RSS feeds. Requires process.env.CRON_SECRET for authentication.

- **Summary**: Updates RSS feeds
- **Description**: Endpoint to update RSS feeds. Requires secret for authentication.
- **Parameters**:
  - **name**: secret
  - **in**: query
  - **required**: true
  - **description**: The secret key for authentication.
  - **schema**:
    - **type**: string

##### Responses:

**200**: RSS feeds successfully updated.

- **content**: application/json
- **schema**:
  - **type**: object
  - **properties**:
    - **success**:
      - **type**: boolean
    - **message**:
      - **type**: string
