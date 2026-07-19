import { getModel } from '../config/llmModels.js';
import { generatePdf } from '../utils/generatePdf.js';
import { getFromS3 } from '../utils/getFromS3.js';
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

export const pdfAgent = async (state) => {
  try {
    const llm = await getModel('pdf');

    const prompt = `
Return ONLY valid JSON.

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

Rules:
- 4 to 6 sections
- each section: 3–5 concise points
- no markdown, no explanation

Topic: ${state.prompt}
`;

    const res = await llm.invoke(prompt);
    const data = safeParse(res.content);
    const pdfBuffer = await generatePdf(data);
    const filename = `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

    await uploadToS3(pdfBuffer, filename, 'application/pdf');

    return {
      ...state,
      aiResponse: `PDF generated successfully`,
      artifacts: [
        {
          id: Date.now(),
          type: 'PDF',
          files: [{ name: filename, content: filename }],
          title: filename,
        },
      ],
    };
  } catch (error) {
    console.error('pdfAgent failed:', error);
    return {
      ...state,
      aiResponse: `PDF generation failed`,
    };
  }
};
