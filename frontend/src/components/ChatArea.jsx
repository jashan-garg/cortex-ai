/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import Nav from './Nav';
import { useDispatch, useSelector } from 'react-redux';
import getMessages from '../features/getMessages.js';
import { setArtifacts, setMessages } from '../redux/messageSlice.js';

const ChatArea = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedConversation) return;

    const getMsg = async () => {
      try {
        if (selectedConversation.title === 'New Chat') {
          dispatch(setMessages([]));
          dispatch(setArtifacts([]));
          return;
        }

        const data = await getMessages(selectedConversation?._id);

        // Ensure messages is always an array
        const messages = Array.isArray(data) ? data : [];

        dispatch(setMessages(messages));

        const latestArtifactMessage = [...messages]
          .reverse()
          .find(
            (msg) => Array.isArray(msg?.artifacts) && msg.artifacts.length > 0
          );

        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      } catch (error) {
        console.log(error);
        dispatch(setArtifacts([]));
      }
    };
    getMsg();
  }, [selectedConversation?._id]);

  return (
    <div className={`flex-1 flex flex-col relative bg-[#0d0d0d]`}>
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatArea;
