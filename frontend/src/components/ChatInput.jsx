/* eslint-disable react-hooks/set-state-in-effect */
import {
  ArrowUp,
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Paperclip,
  Presentation,
  X,
  Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import sendMessage from '../features/sendMessage.js';
import { createConversation } from '../features/createConversation.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  addMessage,
  setDraft,
  setArtifacts,
  setSending,
} from '../redux/messageSlice.js';
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from '../redux/conversationSlice.js';
import { setCredits } from '../redux/userSlice.js';
import { updateConversation } from '../features/updateConversation.js';

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const ChatInput = () => {
  const [selectedAgent, setSelectedAgent] = useState('Auto');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { draft, isSending } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const value = draft || '';

  useEffect(() => {
    setSelectedFile(null);
  }, [selectedConversation]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const maxHeight = 200;

    if (el.scrollHeight > maxHeight) {
      el.style.height = maxHeight + 'px';
      el.style.overflowY = 'auto';
    } else {
      el.style.height = el.scrollHeight + 'px';
      el.style.overflowY = 'hidden';
    }
  };

  const handleSendMessage = async () => {
    const prompt = value.trim();
    if (!prompt || isSending) return;

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

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('conversationId', conversation._id);
    formData.append('agent', selectedAgent.toLowerCase());
    formData.append('file', selectedFile);

    dispatch(
      addMessage({
        _id: makeId(),
        role: 'user',
        content: prompt,
        images: [],
        artifacts: [],
      })
    );
    dispatch(setDraft(''));
    dispatch(setSending(true));

    try {
      const data = await sendMessage(formData);
      if (data.credits !== undefined) dispatch(setCredits(data.credits));
      if (data.artifacts?.length) dispatch(setArtifacts(data.artifacts));

      const cleanAnswer =
        typeof data.answer === 'string'
          ? data.answer.replace(/^```[\s\S]*?```$/, (match) =>
              match.replace(/```/g, '')
            )
          : '';

      dispatch(
        addMessage({
          _id: makeId(),
          role: 'assistant',
          content: cleanAnswer,
          images: data.images || [],
          artifacts: data.artifacts || [],
        })
      );
    } catch (err) {
      console.error('Send failed:', err);
      dispatch(
        addMessage({
          _id: makeId(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          images: [],
          artifacts: [],
        })
      );
    } finally {
      setSelectedFile(null);
      dispatch(setSending(false));
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const agents = [
    { id: 'auto', icon: Zap, label: 'Auto' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'coding', icon: Code2, label: 'Coding' },
    { id: 'pdf', icon: FileText, label: 'PDF' },
    { id: 'ppt', icon: Presentation, label: 'PPT' },
    { id: 'vision', icon: ImageIcon, label: 'Vision' },
    { id: 'search', icon: Globe, label: 'Search' },
  ];

  return (
    <div className="relative">
      {/* Gradient fade at top */}
      <div className="absolute -top-7.5 left-0 w-full h-7.5 bg-linear-to-b from-transparent to-[#0d0d0d] pointer-events-none" />

      <div className="px-4 pb-6 pt-3 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto">
          {/* File preview pill */}
          {selectedFile && (
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[13px] max-w-full">
                <Paperclip size={14} className="text-neutral-400 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div
            className={`flex flex-col gap-2.5 rounded-2xl px-4 pt-3 pb-2.5 bg-[#111111] border border-white/6 transition-all duration-200
              ${
                isFocused
                  ? 'border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                  : ''
              }`}
          >
            <textarea
              ref={textareaRef}
              placeholder="Ask anything"
              rows={2}
              value={value}
              disabled={isSending}
              onChange={(e) => {
                dispatch(setDraft(e.target.value));
                autoResize();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-transparent outline-none resize-none text-[15px] text-neutral-200 placeholder:text-neutral-500 leading-relaxed px-1 overflow-hidden disabled:opacity-50"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
                <input
                  type="file"
                  accept=".pdf, image/*"
                  hidden
                  ref={fileRef}
                  onChange={(e) => {
                    const file = e?.target?.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />

                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition"
                  onClick={() => fileRef?.current?.click()}
                >
                  <Paperclip size={16} />
                </button>

                <div className="w-px h-5 bg-white/8 mx-0.5 sm:mx-1" />

                {agents.map((agent) => {
                  const isActive = selectedAgent === agent.label;
                  const Icon = agent.icon;

                  return (
                    <button
                      key={agent.id}
                      type="button"
                      disabled={isSending}
                      onClick={() => setSelectedAgent(agent.label)}
                      title={agent.label} // show full label on hover (mobile)
                      className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-[12px] transition disabled:opacity-40 ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={13} className="shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">
                        {agent.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={!value.trim() || isSending}
                  onClick={handleSendMessage}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                    value.trim() && !isSending
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
