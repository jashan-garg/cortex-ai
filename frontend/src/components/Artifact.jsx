/* eslint-disable react-hooks/set-state-in-effect */
import {
  Code2,
  Copy,
  Check,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  Download,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { easeInOut, motion } from 'motion/react';
import Editor from '@monaco-editor/react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../../utils/axios.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PdfViewer = ({ fileId }) => {
  const containerRef = useRef(null);
  const pageRefs = useRef([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    if (!fileId) return;

    let objectUrl = null;
    setLoadingPdf(true);
    setError(null);
    setNumPages(null);

    api
      .get(`/api/agent/get-pdf/${fileId}`, { responseType: 'blob' })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setPdfUrl(objectUrl);
        setLoadingPdf(false);
      })
      .catch((err) => {
        console.error('Failed to fetch PDF:', err);
        setError('Failed to load PDF.');
        setLoadingPdf(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  useEffect(() => {
    setNumPages(null);
    setCurrentPage(1);
    setError(null);
    pageRefs.current = [];
  }, [fileId]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!numPages || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) {
          setCurrentPage(Number(mostVisible.target.dataset.pageNumber));
        }
      },
      { root: containerRef.current, threshold: [0.5] }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    console.error('Failed to render PDF:', err);
    setError('Failed to render PDF.');
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex flex-col items-center gap-4 p-4"
      >
        {error ? (
          <div className="text-zinc-400 text-sm self-center">{error}</div>
        ) : loadingPdf || !pdfUrl ? (
          <div className="text-zinc-400 text-sm py-10">Loading PDF...</div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="text-zinc-400 text-sm py-10">Loading PDF...</div>
            }
          >
            {containerWidth > 0 &&
              Array.from({ length: numPages || 0 }, (_, i) => (
                <div
                  key={i}
                  ref={(el) => (pageRefs.current[i] = el)}
                  data-page-number={i + 1}
                  className={
                    i < numPages - 1
                      ? 'pb-4 mb-4 border-b border-zinc-800 w-full flex justify-center'
                      : 'w-full flex justify-center'
                  }
                >
                  <Page
                    pageNumber={i + 1}
                    width={Math.min(containerWidth - 32, 800)}
                    renderAnnotationLayer
                    renderTextLayer
                    className="shadow-lg"
                  />
                </div>
              ))}
          </Document>
        )}
      </div>

      {numPages > 1 && (
        <div className="h-10 border-t border-zinc-800 flex items-center justify-center shrink-0">
          <span className="text-[12px] text-zinc-400 tabular-nums">
            Page {currentPage} of {numPages}
          </span>
        </div>
      )}
    </div>
  );
};

const Artifact = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { artifacts } = useSelector((state) => state.message);

  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('code');
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!artifacts?.length || !selectedConversation) return null;

  const artifact = artifacts[0];

  const isPDF = artifact?.type === 'PDF';
  const isPPT = artifact?.type === 'PPT';
  const pdfFileId = artifact?.files?.[0]?.content;

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

  const handleDownload = async () => {
    try {
      if (isPDF || isPPT) {
        const target = artifact?.files?.[0];
        if (!target?.content) return;

        const res = await api.get(`/api/agent/get-pdf/${target.content}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = target.name || artifact?.title || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      } else {
        if (!file?.content) return;

        const blob = new Blob([file.content], { type: 'text/plain' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.name || 'file.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
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
          {/* Header */}
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-3 shrink-0">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={() => setCollapsed(true)}
            >
              <PanelRightClose size={16} />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 border border-zinc-700">
                <Code2 size={12} className="text-zinc-300" />
              </div>

              <div className="text-[13px] font-medium text-zinc-100 truncate">
                {artifact?.title}
              </div>
            </div>

            {!isPDF && tab === 'code' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            )}

            {((!isPDF && tab === 'code') || isPDF || isPPT) && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
              >
                <Download size={15} />
              </button>
            )}

            {canPreview && !isPDF && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => setTab('code')}
                  className={`px-2.5 py-1 text-[11px] rounded-md ${
                    tab === 'code'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Code2 size={11} /> Code
                </button>

                <button
                  onClick={() => setTab('preview')}
                  className={`px-2.5 py-1 text-[11px] rounded-md ${
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

          {tab === 'code' && !isPDF && (
            <div className="flex border-b border-zinc-800 overflow-x-auto">
              {artifact.files?.map((f, index) => (
                <button
                  key={f.name}
                  onClick={() => setActiveFile(index)}
                  className={`px-4 py-2.5 text-[11px] border-r border-zinc-800 ${
                    activeFile === index
                      ? 'text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {isPDF ? (
              <PdfViewer fileId={pdfFileId} />
            ) : canPreview && tab === 'preview' ? (
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
