import { getModel } from '../config/llmModels.js';

export const chatAgent = async (state) => {
    const llm = await getModel('chat');
    const systemPrompt =
        'You are Cortex AI, an intellegent AI assistant, made by Jashan Garg.';

    const response = await llm.invoke([
        {
            role: 'System',
            content: systemPrompt,
        },
        {
            role: 'user',
            content: state.prompt,
        },
    ]);
    return { ...state, aiResponse: response.content };
};
