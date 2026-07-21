import { getModel } from '../config/llmModels.js';
import { deductCredits } from '../utils/deductCredits.js';

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
    const cleaned = cleanJson(text);
    return JSON.parse(cleaned);
  }
};

export const codingAgent = async (state) => {
  const intentLlm = await getModel('intent');
  const llm = await getModel('coding');
  const intentRes = await intentLlm.invoke(`
      You are an intent classifier. Return ONLY one of these values. 
      CODE_GENERATION
      CODE_REVIEW
      CODE_EXPLANATION
      DEBUGGING
      OPTIMIZATION
      CONVERSION
      DOCUMENTATION

      User Request: ${state.prompt}
  `);

  const intent = intentRes.content.trim();
  if (intent == 'CODE_GENERATION') {
    const prompt = `You are Cortex AI Coding Agent, made by Jashan Garg. Generate the requested project.
      Default stack:
      - HTML
      - CSS
      - JavaScript
      Use React / Next.js / Vue ONLY if explicitly requested.

      Rules:
      - Responsive
      - Modern UI
      - CSS Variables
      - Flexbox/Grid
      - Smooth Scroll
      - Hover Effects
      - Beautiful spacing
      - Single page unless user asks otherwise.

      Return ONLY valid JSON.

      IMAGES
      - Always use real Unsplash images.
      - Never use placeholders.
      
      Schema:
      {
        "files":[
          {
            "name": "index.html",
            "content": "...",
          },
          {
            "name": "style.css",
            "content": "...",
          },
          {
            "name": "script.js",
            "content": "...",
          }
        ]
      }
      
      Rules:

      - Output must start with {
      - Output must end with }
      - No markdown
      - No explanation
      - No extra text
      - No \`\`\`
      - Never mention intent
      
    User Request: ${state.prompt}`;

    const res = await llm.invoke(prompt);
    const data = safeParse(res.content);
    await deductCredits(state.userId, 'coding');
    return {
      ...state,
      aiResponse: 'Code generated successfully!',
      artifacts: [
        {
          id: Date.now(),
          type: 'Project',
          files: data.files || [],
          title: state.prompt,
        },
      ],
    };
  }
  await deductCredits(state.userId, 'coding');
  const res = await llm.invoke(` 
    You are Cortex AI Coding Agent, made by Jashan Garg.
    The user's request is: ${intent}
    Return Markdown only.
    Never generate project files.
    Use headings like:
    # Overview
    ## Explanation
    ## Problems
    ## Improvements
    ## Best Practices
    ## Optimized Code (if needed)
    User Request:
    ${state.prompt}
  `);

  return {
    ...state,
    aiResponse: res.content,
    artifacts: [],
  };
};
