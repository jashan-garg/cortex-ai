import {
  Code2,
  Copy,
  Check,
  Eye,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { easeInOut, motion } from 'motion/react';
import Editor from '@monaco-editor/react';

const Artifact = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('code');
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const { artifacts } = useSelector((state) => state.message);
  if (!artifacts?.length || !selectedConversation) return null;
  const artifact = artifacts[0];
  const file = artifact?.files?.[activeFile];
  const htmlFile = artifact?.files?.find((f) => f.name === 'index.html');
  const cssFile = artifact?.files?.find((f) => f.name === 'style.css');
  const jsFile = artifact?.files?.find((f) => f.name === 'script.js');
  const canPreview = Boolean(htmlFile);

  const previewDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
        <style>${cssFile?.content || ''}</style>
      </head>
      <body>
        ${htmlFile?.content || ''}
        <script>${jsFile?.content || ''}</script>
      </body>
    </html>`;

  const detectLanguage = (fileName = '') => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.html')) return 'html';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
    if (name.endsWith('.json')) return 'json';
    if (name.endsWith('.py')) return 'python';
    if (name.endsWith('.java')) return 'java';
    if (name.endsWith('.cpp')) return 'cpp';
    if (name.endsWith('.c')) return 'c';
    return 'plaintext';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file?.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      className="hidden lg:flex h-full border border-zinc-800 flex-col overflow-hidden shrink-0"
      initial={{ width: 600 }}
      animate={{ width: collapsed ? 48 : 600 }}
      transition={{ duration: 0.25, ease: easeInOut }}
    >
      {!collapsed ? (
        <div className="flex flex-col h-full bg-[#0d0d0d]">
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-3 shrink-0">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-150"
              onClick={() => setCollapsed(true)}
            >
              <PanelRightClose size={16} />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700">
                <Code2 className="text-zinc-300" size={12} />
              </div>

              <div className="text-[13px] font-medium text-zinc-100 truncate">
                {artifact?.title}
              </div>
            </div>

            {tab == 'code' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors duration-150"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            )}

            {canPreview && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => setTab('code')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-colors duration-150 ${
                    tab === 'code'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Code2 size={11} /> Code
                </button>

                <button
                  onClick={() => setTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-colors duration-150 ${
                    tab === 'preview'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Eye size={11} /> Preview
                </button>
              </div>
            )}
          </div>

          {tab === 'code' && (
            <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-none">
              {artifact.files?.map((f, index) => (
                <button
                  key={f.name}
                  onClick={() => setActiveFile(index)}
                  className={`relative px-4 py-2.5 text-[11px] border-r border-zinc-800 transition-colors duration-150 ${
                    activeFile === index
                      ? 'text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f.name}
                  {activeFile === index && (
                    <motion.div
                      layoutId="filetab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {canPreview && tab === 'preview' ? (
              <iframe
                title="preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="w-full h-full bg-white"
              />
            ) : (
              <Editor
                theme="vs-dark"
                language={detectLanguage(file?.name || '')}
                value={file?.content || ''}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'none',
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex h-full border-l border-zinc-800 bg-[#0d0d0d] flex-col items-center py-4 gap-3">
          <button
            onClick={() => setCollapsed(false)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <PanelRightOpen size={16} />
          </button>

          <div
            className="text-[10px] text-zinc-600 tracking-widest uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {artifact?.title}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Artifact;
