import { ChatGroq } from '@langchain/groq';
import { ChatGoogle } from '@langchain/google';

const groq = new ChatGroq({
  model: 'openai/gpt-oss-120b',
});

const coding = new ChatGroq({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  maxTokens: 4096,
  reasoningEffort: 'low',
});

const gemini = new ChatGoogle('gemini-flash-latest');

export const getModel = (agent) => {
  switch (agent) {
    case 'chat':
      return groq;
    case 'search':
      return groq;
    case 'coding':
      return coding;
    case 'imageAnalyzer':
      return gemini;
    default:
      return groq;
  }
};
