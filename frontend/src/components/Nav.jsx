import { MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

const Nav = () => {
    const { selectedConversation } = useSelector((state) => state.conversation);
    const { messages } = useSelector((state) => state.message);

    return (
        <div className="h-14 flex gap-2.5 items-center px-5 border-b border-white/6 bg-[#0d0f14]">
            <div className="">
                <MessageSquare />
            </div>
            <div className="">{selectedConversation?.title || 'New Chat'}</div>
            <div className=""></div>
        </div>
    );
};

export default Nav;
