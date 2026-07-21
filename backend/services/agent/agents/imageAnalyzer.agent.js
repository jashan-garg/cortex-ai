import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getModel } from '../config/llmModels.js';
import fs from 'fs';

export const imageAnalyzer = async (state) => {
  try {
    const llm = await getModel('imageAnalyzer');
    const imageBuffer = await fs.readFile(state?.file?.path);
    const base64image = imageBuffer.toString('base64');

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
        content: {
          type: 'text',
          text: state?.prompt,
        },
      }),
    ];
  } catch (error) {}
};
