const cosineSimilarity = (left, right) => {
  if (!left?.length || left.length !== right?.length) return -1;

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dotProduct += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dotProduct / denominator : -1;
};

export const selectRelevantDocuments = async (
  documents,
  query,
  embeddingModel,
  limit = 5
) => {
  if (!documents.length) return [];

  const contents = documents.map((document) => document.pageContent);
  const [documentVectors, queryVector] = await Promise.all([
    embeddingModel.embedDocuments(contents),
    embeddingModel.embedQuery(query),
  ]);

  return documents
    .map((document, index) => ({
      document,
      score: cosineSimilarity(documentVectors[index], queryVector),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.min(limit, documents.length))
    .map(({ document }) => document);
};
