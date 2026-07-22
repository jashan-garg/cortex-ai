import { getModel } from '../config/llmModels.js';
import axios from 'axios';
import { deductCredits } from '../utils/deductCredits.js';
import { checkLimit } from '../config/agentLimit.js';

export const visionAgent = async (state) => {
  await checkLimit(state.userId, 'vision');
  const llm = await getModel('vision');

  const res = await llm.invoke(`
    Convert the user request into a concise Unsplash search query.
    Return only 2-5 keywords, no punctuation, no explanation. User Request: ${state.prompt}
  `);

  const query = res.content.trim();

  try {
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: 1,
        orientation: 'landscape',
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    const photo = data.results[0];

    if (!photo) {
      return {
        ...state,
        aiResponse: `No image found for "${query}".`,
      };
    }
    await deductCredits(state.userId, 'vision');
    return {
      ...state,
      images: [photo.urls.regular],
    };
  } catch (err) {
    console.error('Unsplash search failed:', err.response?.data || err.message);
    return {
      ...state,
      aiResponse: `Failed to find image`,
    };
  }
};
