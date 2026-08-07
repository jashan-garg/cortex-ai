import { checkLimit } from '../config/agentLimit.js';
import { searchTool } from '../config/tavily.js';
import { deductCredits } from '../utils/deductCredits.js';

export const searchAgent = async (state) => {
  try {
    await checkLimit(state.userId, 'search');
    const results = await searchTool.invoke({
      query: state.prompt,
    });
    const sources = Array.isArray(results?.results) ? results.results : [];

    if (!results?.answer && sources.length === 0) {
      throw new Error(results?.error || 'No search results found.');
    }

    const sourceList = sources
      .slice(0, 5)
      .map(
        (source, index) =>
          `${index + 1}. [${source.title || source.url}](${source.url})`
      )
      .join('\n');
    const answer = [
      results?.answer || sources[0]?.content || 'No answer found.',
      sourceList ? `## Sources\n\n${sourceList}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    const deductRes = await deductCredits(state.userId, 'search');

    return {
      ...state,
      aiResponse: answer,
      searchResults: results,
      images: results?.images || [],
      credits: deductRes?.credits,
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error.message || 'Search failed. Please try again.',
      searchResults: [],
      images: [],
    };
  }
};
