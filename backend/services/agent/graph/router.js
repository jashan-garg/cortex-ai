import { getModel } from '../config/llmModels.js';

export const router = async (state) => {
  if (state.agent && state.agent != 'auto')
    return {
      ...state,
      agent: state.agent,
    };

  if (state?.file?.mimetype === 'application/pdf')
    return {
      ...state,
      agent: 'pdfRag',
    };

  if (state?.file?.mimetype?.startsWith('image/'))
    return {
      ...state,
      agent: 'imageAnalyzer',
    };

  const llm = await getModel('router');
  const prompt = `You are an agent router. Classify the user query into exactly ONE agent.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision
- datetime

Definitions:

chat:
General conversation, greetings, small talk, opinions, explanations,
learning, jokes, or any question you can answer from general knowledge
without needing live/current data.

search:
Queries that need CURRENT, real-time, or recent information from the internet —
news, live prices, scores, recent events, "latest" anything, product recommendations,
or facts that change over time and you cannot know reliably.
Do NOT use search for greetings, small talk, or date/time questions — those have
dedicated agents.

coding:
Generate code, debug code, build projects, architecture, API design.

pdf:
Generating PDFs or questions about PDF document context.

ppt:
Generating PPTs or questions about ppt context.

vision:
Generating images or editing images.

datetime:
Any question asking for the current date, day, or time (e.g. "what time is it",
"what's the date today", "time rn"). These must NEVER go to search or chat,
since only this agent can return an accurate live value.

Examples:
Query: "hi" -> chat
Query: "hello there" -> chat
Query: "what time is it right now" -> datetime
Query: "what's today's date" -> datetime
Query: "what's the time in India" -> datetime
Query: "latest iPhone price in India" -> search
Query: "trending men's jeans" -> search
Query: "explain recursion" -> chat
Query: "write a function to reverse a linked list" -> coding

Return ONLY one word, lowercase, no punctuation:
chat
search
coding
pdf
ppt
vision
datetime

        User Query: ${state.prompt}`;

  const response = await llm.invoke(prompt);
  return { ...state, agent: response.content.trim().toLowerCase() };
};
