import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getModel } from '../config/llmModels.js';
import fs from 'fs/promises';
import { deductCredits } from '../utils/deductCredits.js';

export const imageAnalyzer = async (state) => {
  const filePath = state?.file?.path;

  if (!filePath) {
    return {
      ...state,
      aiResponse: 'No image file provided.',
    };
  }

  try {
    const llm = await getModel('imageAnalyzer');
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');

    const messages = [
      new SystemMessage(`
        You are Cortex AI Image Analyzer Agent, made by Jashan Garg.
        Rules:
          - Analyze only the uploaded image.
          - Answer the user's question accurately.
          - If text exists in the image, extract it.
          - If charts or tables exist, explain them.
          - If something is unclear, say so.
          - Use Markdown when helpful.
          - Do not hallucinate.
      `),
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: state?.prompt || 'Analyse the image',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${state?.file?.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    return {
      ...state,
      aiResponse: response?.content,
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    return {
      ...state,
      aiResponse: 'Failed to analyse the image.',
    };
  } finally {
    await deductCredits(state.userId, 'vision');
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      console.error('Failed to delete temp file:', unlinkErr);
    }
  }
};
