import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { getModel } from '../config/llmModels.js';
import { getMemory } from '../config/memory.js';
import { deductCredits } from '../utils/deductCredits.js';

export const chatAgent = async (state) => {
  try {
    const llm = await getModel('chat');
    const history = (await getMemory(state.conversationId)) || [];
    const searchContext = state.searchResults?.results?.length
      ? `Web search results:\n${state.searchResults.results
          .map((r, i) => `[${i + 1}] ${r.title}\n${r.content.slice(0, 1000)}`)
          .join(
            '\n\n'
          )}\n\nAnswer the user using only the above search results.`
      : '';

    const systemPrompt = `
        You are Cortex AI, an intellegent AI assistant, made by Jashan Garg.

        ${searchContext}

        If searchContext exists:
        - Use search results to answer.
        - Do not mention internal tools.

        Rules:
        - For simple questions, greetings, and short queries, respond naturally in plain text.
        - For technical, educational, coding, or detailed topics, use clean Markdown.

        Formatting:
        - Use # for titles and ## for sections.
        - Leave a blank line after headings.
        - Use bullet points for lists.
        - Use numbered lists for steps.
        - Use fenced code blocks with language tags for code.
        - Keep paragraphs short and readable.
        - Never write headings and content on the same line.
        - Never generate large walls of text.`;

    const messages = [new SystemMessage(systemPrompt)];

    history.forEach((msg) => {
      // Skip null/undefined messages or messages without content
      if (!msg || msg.content == null) return;

      const content =
        typeof msg.content === 'string' ? msg.content : String(msg.content);

      if (msg.role === 'user') {
        messages.push(new HumanMessage(content));
      } else if (msg.role === 'assistant' || msg.role === 'ai') {
        messages.push(new AIMessage(content));
      }
    });

    messages.push(new HumanMessage(state.prompt));
    const response = await llm.invoke(messages);

    const deductRes = await deductCredits(state.userId, 'chat');

    return {
      ...state,
      aiResponse: response.content,
      credits: deductRes?.credits, // Pass credits through graph state
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: `Some error occured, please try again.`,
    };
  }
};
