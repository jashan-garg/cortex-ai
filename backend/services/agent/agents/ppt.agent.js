import { checkLimit } from '../config/agentLimit.js';
import { getModel } from '../config/llmModels.js';
import { deductCredits } from '../utils/deductCredits.js';
import { generatePresentationPdf } from '../utils/generatePresentationPdf.js';
import { uploadToS3 } from '../utils/uploadToS3.js';

const cleanJson = (text) => {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
};

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(cleanJson(text));
  }
};

export const pptAgent = async (state) => {
  try {
    await checkLimit(state.userId, 'ppt');
    const llm = await getModel('ppt');

    const prompt = `
Return ONLY valid JSON.

{
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": []
    }
  ]
}

Rules:
- exactly 6 slides
- each slide: 4–6 concise points
- no markdown, no explanation
- no code block

Topic: ${state.prompt}
    `;

    const res = await llm.invoke(prompt);
    const data = safeParse(res.content);

    if (
      !data ||
      !data.title ||
      !Array.isArray(data.slides) ||
      data.slides.length === 0
    ) {
      throw new Error('Invalid PPT data from LLM');
    }

    const pdfBuffer = await generatePresentationPdf(data);

    const filename = `ppt-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.pdf`;

    await uploadToS3(pdfBuffer, filename, 'application/pdf');
    await deductCredits(state.userId, 'ppt');
    return {
      ...state,
      aiResponse: `Presentation generated successfully`,
      artifacts: [
        {
          id: Date.now(),
          type: 'PDF',
          files: [{ name: filename, content: filename }],
          title: data.title || filename,
        },
      ],
    };
  } catch (error) {
    console.error('ppt Agent failed:', error);
    return {
      ...state,
      aiResponse: `Presentation generation failed`,
    };
  }
};
