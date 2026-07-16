import { ChatGroq } from '@langchain/groq';
import { ChatGoogle } from '@langchain/google';

const groq = new ChatGroq({
    model: 'openai/gpt-oss-120b',
});
const gemini = new ChatGoogle('gemini-2.5-flash');

export const getModel = (agent) => {
    switch (agent) {
        case 'chat':
            return groq;
        case 'search':
            return groq;
        case 'coding':
            return gemini;
        default:
            return groq;
    }
};
