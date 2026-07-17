import { MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

const Nav = () => {
    const { selectedConversation } = useSelector((state) => state.conversation);
    const { messages } = useSelector((state) => state.message);

    return (
        <>
            {selectedConversation && (
                <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 bg-[#0b0c10]/95 backdrop-blur supports-backdrop-filter:bg-[#0b0c10]/80">
                    {/* Left Section */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10">
                            <MessageSquare
                                size={14}
                                className="text-slate-300"
                            />
                        </div>

                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-[14px] font-semibold text-slate-100 truncate">
                                {selectedConversation?.title || 'New Chat'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Conversation
                            </span>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            {messages?.length || 0} messages
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Nav;
