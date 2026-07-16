/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import Nav from './Nav';
import { useDispatch, useSelector } from 'react-redux';
import getMessages from '../features/getMessages.js';
import { setMessages } from '../redux/messageSlice.js';

const ChatArea = () => {
    const { selectedConversation } = useSelector((state) => state.conversation);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!selectedConversation) return;
        try {
            const getMsg = async () => {
                const data = await getMessages(selectedConversation?._id);
                dispatch(setMessages(data));
            };
            getMsg();
        } catch (error) {
            console.log(error);
        }
    }, [selectedConversation]);

    return (
        <div className={`flex-1 flex flex-col`}>
            <Nav />
            <MessageList />
            <ChatInput />
        </div>
    );
};

export default ChatArea;
