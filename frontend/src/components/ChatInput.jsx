import {
    ArrowUp,
    Code2,
    FileText,
    Globe,
    ImageIcon,
    MessageSquare,
    Mic,
    Paperclip,
    Presentation,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import sendMessage from '../features/sendMessage.js';
import { createConversation } from '../features/createConversation.js';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../redux/messageSlice.js';
import {
    addConversation,
    setConvTitle,
    setSelectedConversation,
} from '../redux/conversationSlice.js';
import { updateConversation } from '../features/updateConversation.js';

const ChatInput = () => {
    const [value, setValue] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('Auto');
    const [isFocused, setIsFocused] = useState(false);

    const { selectedConversation } = useSelector((state) => state.conversation);
    const dispatch = useDispatch();

    const handleSendMessage = async () => {
        const prompt = value.trim();
        if (!prompt) return;

        let conversation = selectedConversation;

        if (!conversation) {
            conversation = await createConversation();
            if (!conversation) return;
            dispatch(setSelectedConversation(conversation));
            dispatch(addConversation(conversation));
        }

        if (conversation?.title === 'New Chat') {
            await updateConversation({
                id: conversation._id,
                title: prompt,
            });
            dispatch(
                setConvTitle({
                    conversationId: conversation._id,
                    title: prompt,
                })
            );
        }

        const payload = {
            prompt,
            conversationId: conversation._id,
            agent: selectedAgent.toLowerCase(),
        };

        dispatch(addMessage({ role: 'user', content: prompt }));
        setValue('');

        const data = await sendMessage(payload);
        dispatch(addMessage({ role: 'assistant', content: data }));
    };

    const agents = [
        { id: 'auto', icon: Zap, label: 'Auto' },
        { id: 'chat', icon: MessageSquare, label: 'Chat' },
        { id: 'coding', icon: Code2, label: 'Coding' },
        { id: 'pdf', icon: FileText, label: 'PDF' },
        { id: 'ppt', icon: Presentation, label: 'PPT' },
        { id: 'image', icon: ImageIcon, label: 'Image' },
        { id: 'search', icon: Globe, label: 'Search' },
    ];

    return (
        <div className="fixed bottom-0 -left-32 right-0">
            {/* GRADIENT FADE (KEY PART) */}
            <div className="absolute -top-7.5 left-0 w-full h-7.5 bg-linear-to-b from-transparent to-[#0a0a0a] pointer-events-none" />

            <div className="px-4 pb-6 pt-3 bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto">
                    {/* Input container (solid, no glass) */}
                    <div
                        className={`flex flex-col gap-2.5 rounded-2xl px-4 pt-3 pb-2.5
                        bg-[#111111]
                        border border-white/6
                        transition-all duration-200
                        ${
                            isFocused
                                ? 'border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                                : ''
                        }`}
                    >
                        {/* Textarea */}
                        <textarea
                            placeholder="Ask anything"
                            rows={2}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            className="w-full bg-transparent outline-none resize-none 
                            text-[15px] text-neutral-200 
                            placeholder:text-neutral-500 
                            leading-relaxed px-1
                            scrollbar-none [&::-webkit-scrollbar]:hidden"
                        />

                        {/* Bottom bar */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                                <button
                                    className="w-8 h-8 flex items-center justify-center 
                                    rounded-full text-neutral-400 
                                    hover:text-white hover:bg-white/5 transition"
                                >
                                    <Paperclip size={16} />
                                </button>

                                <div className="w-px h-5 bg-white/8 mx-1" />

                                {agents.map((agent) => {
                                    const isActive =
                                        selectedAgent === agent.label;
                                    const Icon = agent.icon;

                                    return (
                                        <button
                                            key={agent.id}
                                            onClick={() =>
                                                setSelectedAgent(agent.label)
                                            }
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] transition ${
                                                isActive
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon size={13} />
                                            {agent.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    className="w-8 h-8 flex items-center justify-center 
                                    rounded-full text-neutral-400 
                                    hover:text-white hover:bg-white/5 transition"
                                >
                                    <Mic size={16} />
                                </button>

                                <button
                                    disabled={!value.trim()}
                                    onClick={handleSendMessage}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                                        value.trim()
                                            ? 'bg-white text-black hover:bg-neutral-200'
                                            : 'bg-white/8 text-white/30 cursor-not-allowed'
                                    }`}
                                >
                                    <ArrowUp size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-neutral-600 mt-2">
                        Cortex AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
