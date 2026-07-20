import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useLayoutEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Code2,
  FileText,
  Presentation,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useDispatch } from 'react-redux';
import { openArtifactPanel } from '../redux/messageSlice.js'; // adjust path to your actual slice location

const COLLAPSED_MAX_HEIGHT = 220;

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.src || img.path || null;
};

const ImageGrid = ({ images, isUser, onSelect }) => {
  const urls = (images || []).map(getImageUrl).filter(Boolean);
  if (!urls.length) return null;

  if (urls.length === 1) {
    return (
      <div className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <button
          onClick={() => onSelect(urls[0])}
          className="rounded-2xl overflow-hidden max-w-70 sm:max-w-xs"
        >
          <img
            src={urls[0]}
            alt="attachment"
            className="w-full max-h-80 object-cover"
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`mb-2 flex gap-1.5 overflow-x-auto ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {urls.map((url, i) => (
        <button
          key={i}
          onClick={() => onSelect(url)}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0"
        >
          <img src={url} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  );
};

const Lightbox = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
      >
        <X size={18} />
      </button>

      <img
        src={src}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full rounded-lg object-contain"
      />
    </div>
  );
};

const artifactIcon = (type) => {
  if (type === 'PDF') return FileText;
  if (type === 'PPT') return Presentation;
  return Code2;
};

const ArtifactChips = ({ artifacts, isUser }) => {
  const dispatch = useDispatch();
  if (!artifacts?.length) return null;

  return (
    <div
      className={`mb-2 flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
    >
      {artifacts.map((artifact) => {
        const Icon = artifactIcon(artifact.type);
        return (
          <button
            key={artifact.id}
            onClick={() => dispatch(openArtifactPanel([artifact]))}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 max-w-70 sm:max-w-xs"
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
              <Icon size={15} className="text-zinc-300" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-[13px] text-slate-100 truncate">
                {artifact.title}
              </div>
              <div className="text-[11px] text-slate-500">Click to open</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const MessageBubble = ({ role, content, images, artifacts }) => {
  const isUser = role === 'user';
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (contentRef.current && isUser) {
      setIsOverflowing(contentRef.current.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }
  }, [content, isUser]);

  const handleMessageCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 1500);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCodeCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch (error) {
      console.log(error);
    }
  };

  const hasContent = Boolean(content?.trim());

  return (
    <div className="w-full py-3">
      <div
        className={`max-w-3xl mx-auto px-3 md:px-4 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div className={`${isUser ? 'max-w-[75%]' : 'w-full'}`}>
          <ImageGrid
            images={images}
            isUser={isUser}
            onSelect={setLightboxSrc}
          />

          <ArtifactChips artifacts={artifacts} isUser={isUser} />

          {hasContent && (
            <div
              ref={contentRef}
              className={`overflow-hidden wrap-break-word text-[15px] leading-7 ${
                isUser
                  ? 'bg-white/10 text-slate-100 rounded-3xl px-4 py-2.5 whitespace-pre-wrap'
                  : 'text-slate-100 [&_p]:mb-3 [&_p:last-child]:mb-0'
              }`}
              style={{
                maxHeight:
                  isUser && !expanded ? `${COLLAPSED_MAX_HEIGHT}px` : 'none',
                maskImage:
                  isUser && !expanded && isOverflowing
                    ? 'linear-gradient(to bottom, black 70%, transparent)'
                    : 'none',
              }}
            >
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children }) {
                    return <div className="my-4">{children}</div>;
                  },

                  code({ node, className, children }) {
                    const code = String(children).replace(/\n$/, '');

                    const isBlock =
                      node?.position?.start?.line !==
                        node?.position?.end?.line || className;

                    if (!isBlock) {
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400">
                          {code}
                        </code>
                      );
                    }

                    const language =
                      className?.replace('language-', '') || 'text';

                    return (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111318]">
                        <div className="flex justify-between items-center px-4 py-2 bg-[#1b1d24] border-b border-white/10">
                          <span className="text-xs text-slate-400 uppercase">
                            {language}
                          </span>

                          <button
                            onClick={() => handleCodeCopy(code)}
                            className="flex items-center gap-1 text-xs"
                          >
                            {copiedCode === code ? (
                              <>
                                <Check size={14} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Copy
                              </>
                            )}
                          </button>
                        </div>

                        <SyntaxHighlighter
                          language={language}
                          style={oneDark}
                          wrapLongLines
                          showLineNumbers
                          customStyle={{
                            margin: 0,
                            padding: '16px',
                            background: '#0d1117',
                            fontSize: '13px',
                          }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                }}
              >
                {content ? content : 'Some error occured, please try again.'}
              </Markdown>
            </div>
          )}

          {isOverflowing && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-xs text-slate-400 flex items-center gap-1"
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

        {hasContent && (
          <button
            onClick={handleMessageCopy}
            className="mt-1.5 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-200"
          >
            {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
};

export default MessageBubble;
