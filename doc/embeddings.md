# CLIP Embedding Similarity Examples

Below are some screenshots of CLIP Embedding similarity results.

Embeddings were added to Elasticsearch as dense vectors:

```
image: {
  ...
  embedding: {
    type: 'dense_vector',
    dims: 512,
    index: true,
    similarity: 'cosine',
  },
  ...
}
```

Example cosine similarity query:

```
const esQuery: T.SearchRequest = {
    index: 'art',
    query: {
      bool: {
        must: [
          { exists: { field: 'image.embedding' } },
          {
            script_score: {
              query: { match_all: {} },
              script: {
                source:
                  "cosineSimilarity(params.query_vector, 'image.embedding') + 1.0",
                params: { query_vector: input_vector },
              },
            },
          },
        ],
        must_not: {
          term: {
            id: document.id,
          },
        },
      },
    },
    from: 0,
    size: SIMILAR_PAGE_SIZE,
};
```

## Examples:

![Example of CLIP Image Embeddings](./img/embeddings/120654.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/149212.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/159018.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/159971.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/166000.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/166076.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/166835.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/166917.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/169803.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/188146.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/214325.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/216211.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/224323.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/224994.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/225053.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/2565.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/3674.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/3796.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/4018.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/4313.jpeg)

![Example of CLIP Image Embeddings](./img/embeddings/5016.jpeg)
