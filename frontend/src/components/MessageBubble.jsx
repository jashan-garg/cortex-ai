import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <div
            className={`flex w-full my-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed rounded-2xl ${
                    isUser
                        ? 'bg-linear-to-br from-indigo-500 to-violet-700 text-white rounded-br-md'
                        : 'bg-white/5 border border-white/7 text-slate-200 rounded-bl-md'
                }`}
            >
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
        </div>
    );
};

export default MessageBubble;
