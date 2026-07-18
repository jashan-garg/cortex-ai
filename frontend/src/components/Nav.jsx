import { MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

const Nav = () => {
    const { selectedConversation } = useSelector((state) => state.conversation);
    const { messages } = useSelector((state) => state.message);

    return (
        <>
            {selectedConversation && (
                <div className="h-14 flex items-center justify-between px-5 absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent">
                    {/* Left Section */}
                    <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare size={16} className="text-slate-400" />
                        <span className="text-[14px] font-medium text-slate-200 truncate">
                            {selectedConversation?.title || 'New Chat'}
                        </span>
                    </div>

                    {/* Right Section */}
                    <div className="text-[12px] text-slate-500">
                        {messages?.length || 0} messages
                    </div>
                </div>
            )}
        </>
    );
};

export default Nav;
