import { ChatGroq } from '@langchain/groq';
import { ChatGoogle } from '@langchain/google';
import { ChatOpenRouter } from '@langchain/openrouter';

const groq = new ChatGroq({
  model: 'openai/gpt-oss-120b',
});

const gemini = new ChatGoogle('gemini-2.5-flash');

const openrouter = new ChatOpenRouter({
  model: 'deepseek/deepseek-chat',
  temperature: 0,
});

export const getModel = (agent) => {
  switch (agent) {
    case 'chat':
      return groq;
    case 'search':
      return groq;
    case 'coding':
      return openrouter;
    case 'imageAnalyzer':
      return gemini;
    default:
      return groq;
  }
};
