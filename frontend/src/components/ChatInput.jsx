import { Mic, Paperclip, Send } from 'lucide-react';
import { useState } from 'react';
import sendMessage from '../features/sendMessage.js';
import { createConversation } from '../features/createConversation.js';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../redux/messageSlice.js';
import {
    addConversation,
    setSelectedConversation,
} from '../redux/conversationSlice.js';

const ChatInput = () => {
    const [value, setValue] = useState('');
    const { selectedConversation } = useSelector((state) => state.conversation);
    const dispatch = useDispatch();

    const handleSendMessage = async () => {
        const prompt = value.trim();
        if (!prompt) return;
        let conversation = selectedConversation;

        if (!conversation) {
            conversation = await createConversation();
            if (!conversation) return;
            dispatch(addConversation(conversation));
            dispatch(setSelectedConversation(conversation));
        }

        const payload = {
            prompt,
            conversationId: conversation._id,
        };

        dispatch(addMessage({ role: 'user', content: prompt }));
        setValue('');
        const data = await sendMessage(payload);
        dispatch(addMessage({ role: 'assistant', content: data }));
    };

    return (
        <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
            <div className="flex flex-col gap-2 bg-white/3 border border-white/7 rounded-2xl px-4 pt-3.5 pb-3">
                <textarea
                    placeholder="Ask me anything!"
                    className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
                    rows={3}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    value={value.trimStart()}
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer">
                            <Paperclip size={16} />
                        </button>

                        <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer">
                            <Mic size={16} />
                        </button>
                    </div>
                    <button
                        disabled={!value}
                        onClick={handleSendMessage}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 border-none cursor-pointer ${value.trim() ? 'bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                    >
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
