/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { easeInOut, motion, AnimatePresence } from 'motion/react';
import { PanelRightOpen, X } from 'lucide-react';
import { setPanelCollapsed, setArtifacts } from '../../redux/messageSlice.js';
import { useDownloadHandlers } from './useDownload.js';
import PdfViewer from './PdfViewer.jsx';
import ArtifactList from './ArtifactList.jsx';
import ArtifactHeader from './ArtifactHeader.jsx';
import FileTabs from './FileTabs.jsx';
import CodeEditor from './CodeEditor.jsx';
import CodePreview from './CodePreview.jsx';

const Artifact = () => {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { artifacts, messages, panelCollapsed } = useSelector(
    (state) => state.message
  );

  const [tab, setTab] = useState('code');
  const [activeFile, setActiveFile] = useState(0);
  const [panelOpen, setPanelOpen] = useState(Boolean(artifacts?.length));
  const [isMobile, setIsMobile] = useState(false);

  const { handleDownload, handleDownloadAll } = useDownloadHandlers();

  useEffect(() => {
    if (artifacts?.length) setPanelOpen(true);
  }, [artifacts]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allArtifacts = useMemo(() => {
    const map = new Map();
    messages?.forEach((msg) => {
      msg?.artifacts?.forEach((a) => {
        if (a?.id != null) map.set(a.id, a);
      });
    });
    return Array.from(map.values());
  }, [messages]);

  useEffect(() => {
    dispatch(setArtifacts([]));
    if (allArtifacts.length > 0) {
      setPanelOpen(true);
    } else {
      setPanelOpen(false);
    }
  }, [selectedConversation?._id, allArtifacts.length, dispatch]);

  useEffect(() => {
    setActiveFile(0);
    setTab('code');
  }, [artifacts?.[0]?.id]);

  if (!panelOpen || !selectedConversation) return null;

  const artifact = artifacts?.[0] || null;
  const expandedWidth = artifact ? 600 : 360;

  const isPDF = artifact?.type === 'PDF';
  const isPPT = artifact?.type === 'PPT';

  const viewFile =
    artifact?.files?.find((f) => f.name?.endsWith('.pdf')) ||
    artifact?.files?.[0];
  const docFileId = viewFile?.content;

  const pptxFile =
    artifact?.files?.find((f) => f.name?.endsWith('.pptx')) ||
    artifact?.files?.[0];

  const file = artifact?.files?.[activeFile];
  const htmlFile = artifact?.files?.find((f) => f.name === 'index.html');
  const cssFile = artifact?.files?.find((f) => f.name === 'style.css');
  const jsFile = artifact?.files?.find((f) => f.name === 'script.js');

  const canPreview = Boolean(htmlFile);

  const onDownloadSingle = () => {
    if (isPPT) {
      handleDownload({ type: 'PPT', files: [pptxFile] });
    } else if (isPDF) {
      handleDownload({ type: 'PDF', files: [viewFile] });
    } else {
      handleDownload(artifact);
    }
  };

  // Helper to close the panel (used on mobile backdrop or close button)
  const closePanel = () => {
    dispatch(setArtifacts([]));
    if (isMobile) setPanelOpen(false);
  };

  // ---------- Mobile Overlay ----------
  if (isMobile) {
    return (
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-[#0d0d0d] border-t border-zinc-800 rounded-t-2xl flex flex-col overflow-hidden"
            >
              {/* Close button at top-right */}
              <button
                onClick={closePanel}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20"
              >
                <X size={16} />
              </button>

              {!artifact ? (
                <ArtifactList
                  artifacts={allArtifacts}
                  onSelect={(a) => dispatch(setArtifacts([a]))}
                  onCollapse={closePanel}
                  onDownloadAll={() => handleDownloadAll(allArtifacts)}
                />
              ) : (
                <div className="flex flex-col h-full">
                  <ArtifactHeader
                    artifact={artifact}
                    tab={tab}
                    onTabChange={setTab}
                    onCollapse={closePanel}
                    onClose={closePanel}
                    onDownload={onDownloadSingle}
                    fileContent={file?.content}
                    canPreview={canPreview}
                  />

                  {tab === 'code' && !isPDF && !isPPT && (
                    <FileTabs
                      files={artifact.files}
                      activeFile={activeFile}
                      onSelect={setActiveFile}
                    />
                  )}

                  <div className="flex-1 overflow-hidden">
                    {isPDF || isPPT ? (
                      <PdfViewer
                        fileId={docFileId}
                        loadingText={
                          isPPT ? 'Loading presentation...' : 'Loading PDF...'
                        }
                        errorText={
                          isPPT
                            ? 'Failed to load presentation.'
                            : 'Failed to load PDF.'
                        }
                      />
                    ) : canPreview && tab === 'preview' ? (
                      <CodePreview
                        htmlFile={htmlFile}
                        cssFile={cssFile}
                        jsFile={jsFile}
                      />
                    ) : (
                      <CodeEditor
                        fileName={file?.name}
                        content={file?.content}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ---------- Desktop Side Panel (unchanged) ----------
  return (
    <motion.div
      className="hidden lg:flex h-full border border-zinc-800 flex-col overflow-hidden shrink-0"
      initial={{ width: 600 }}
      animate={{ width: panelCollapsed ? 48 : expandedWidth }}
      transition={{ duration: 0.25, ease: easeInOut }}
    >
      {!panelCollapsed ? (
        <div className="flex flex-col h-full bg-[#0d0d0d]">
          {!artifact ? (
            <ArtifactList
              artifacts={allArtifacts}
              onSelect={(a) => dispatch(setArtifacts([a]))}
              onCollapse={() => dispatch(setPanelCollapsed(true))}
              onDownloadAll={() => handleDownloadAll(allArtifacts)}
            />
          ) : (
            <>
              <ArtifactHeader
                artifact={artifact}
                tab={tab}
                onTabChange={setTab}
                onCollapse={() => dispatch(setPanelCollapsed(true))}
                onClose={() => dispatch(setArtifacts([]))}
                onDownload={onDownloadSingle}
                fileContent={file?.content}
                canPreview={canPreview}
              />

              {tab === 'code' && !isPDF && !isPPT && (
                <FileTabs
                  files={artifact.files}
                  activeFile={activeFile}
                  onSelect={setActiveFile}
                />
              )}

              <div className="flex-1 overflow-hidden">
                {isPDF || isPPT ? (
                  <PdfViewer
                    fileId={docFileId}
                    loadingText={
                      isPPT ? 'Loading presentation...' : 'Loading PDF...'
                    }
                    errorText={
                      isPPT
                        ? 'Failed to load presentation.'
                        : 'Failed to load PDF.'
                    }
                  />
                ) : canPreview && tab === 'preview' ? (
                  <CodePreview
                    htmlFile={htmlFile}
                    cssFile={cssFile}
                    jsFile={jsFile}
                  />
                ) : (
                  <CodeEditor fileName={file?.name} content={file?.content} />
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex h-full border-l border-zinc-800 bg-[#0d0d0d] flex-col items-center py-4 gap-3">
          <button
            onClick={() => dispatch(setPanelCollapsed(false))}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <PanelRightOpen size={16} />
          </button>

          <div
            className="text-[10px] text-zinc-600 tracking-widest uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {artifact?.title || 'Artifacts'}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Artifact;
