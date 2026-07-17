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

        if (conversation?.title == 'New Chat') {
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
        <div className="w-full px-3 md:px-5 pb-5 pt-2 bg-[#0d0f14]">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col gap-2.5 bg-white/6 rounded-[26px] px-3.5 pt-3 pb-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.25)]">
                    <textarea
                        placeholder="Ask anything"
                        className="w-full bg-transparent outline-none resize-none text-[15px] text-slate-100 placeholder:text-slate-500 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50 px-1"
                        rows={2}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        value={value}
                    />

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                            <button className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 border-none transition-colors duration-150 bg-transparent cursor-pointer">
                                <Paperclip size={17} />
                            </button>

                            <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

                            {agents.map((agent) => {
                                const isActive = selectedAgent === agent.label;
                                const Icon = agent.icon;
                                return (
                                    <button
                                        key={agent.id}
                                        onClick={() =>
                                            setSelectedAgent(agent.label)
                                        }
                                        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12.5px] font-medium border-none cursor-pointer transition-colors duration-150 ${
                                            isActive
                                                ? 'bg-white/12 text-slate-100'
                                                : 'bg-transparent text-slate-400 hover:bg-white/8 hover:text-slate-200'
                                        }`}
                                    >
                                        <Icon size={13.5} />
                                        {agent.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 border-none transition-colors duration-150 bg-transparent cursor-pointer">
                                <Mic size={17} />
                            </button>
                            <button
                                disabled={!value.trim()}
                                onClick={handleSendMessage}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 border-none cursor-pointer ${
                                    value.trim()
                                        ? 'bg-white text-black hover:bg-slate-200'
                                        : 'bg-white/15 text-white/40 cursor-not-allowed'
                                }`}
                            >
                                <ArrowUp size={17} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-600 mt-2">
                    Cortex AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
};

export default ChatInput;
