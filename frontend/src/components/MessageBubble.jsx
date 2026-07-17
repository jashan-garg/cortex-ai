import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const COLLAPSED_MAX_HEIGHT = 220; // px

const MessageBubble = ({ role, content }) => {
    const isUser = role === 'user';
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [copied, setCopied] = useState(false);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(
                contentRef.current.scrollHeight > COLLAPSED_MAX_HEIGHT
            );
        }
    }, [content]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy message:', err);
        }
    };

    return (
        <div className="w-full py-3">
            <div
                className={`max-w-3xl mx-auto px-3 md:px-4 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
                <div className={`min-w-0 ${isUser ? 'max-w-[75%]' : 'w-full'}`}>
                    <div
                        ref={contentRef}
                        className={`overflow-hidden wrap-break-word text-[15px] leading-7 ${
                            isUser
                                ? 'bg-white/10 text-slate-100 rounded-3xl px-4 py-2.5 whitespace-pre-wrap'
                                : 'text-slate-100 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_a]:text-indigo-400 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400 [&_blockquote]:my-2 [&_code]:bg-white/10 [&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre]:bg-black/40 [&_pre]:border [&_pre]:border-white/7 [&_pre]:rounded-xl [&_pre]:p-3.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_td]:border [&_td]:border-white/10 [&_td]:px-2.5 [&_td]:py-1.5'
                        }`}
                        style={{
                            maxHeight: expanded
                                ? 'none'
                                : `${COLLAPSED_MAX_HEIGHT}px`,
                            maskImage:
                                !expanded && isOverflowing
                                    ? 'linear-gradient(to bottom, black 70%, transparent 100%)'
                                    : 'none',
                            WebkitMaskImage:
                                !expanded && isOverflowing
                                    ? 'linear-gradient(to bottom, black 70%, transparent 100%)'
                                    : 'none',
                        }}
                    >
                        <Markdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </Markdown>
                    </div>

                    {isOverflowing && (
                        <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer p-0 transition-colors"
                        >
                            {expanded ? (
                                <>
                                    Show less <ChevronUp size={13} />
                                </>
                            ) : (
                                <>
                                    Show more <ChevronDown size={13} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                <button
                    onClick={handleCopy}
                    title={copied ? 'Copied' : 'Copy'}
                    className="mt-1.5 flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/7 border-none bg-transparent cursor-pointer transition-all duration-150"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
};

export default MessageBubble;
