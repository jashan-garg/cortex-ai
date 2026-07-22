import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001',
});
