/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../../../utils/axios.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PdfViewer = ({
  fileId,
  loadingText = 'Loading PDF...',
  errorText = 'Failed to load PDF.',
}) => {
  const containerRef = useRef(null);
  const pageRefs = useRef([]);
  const objectUrlRef = useRef(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;

    setNumPages(null);
    setCurrentPage(1);
    setError(null);
    setPdfUrl(null);
    setLoadingPdf(true);
    pageRefs.current = [];

    api
      .get(`/api/agent/get-pdf/${fileId}`, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        const url = URL.createObjectURL(response.data);
        objectUrlRef.current = url;
        setPdfUrl(url);
        setLoadingPdf(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch PDF:', err);
        setError(errorText);
        setLoadingPdf(false);
      });

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [fileId, errorText]);

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

  const onDocumentLoadError = useCallback(
    (err) => {
      console.error('Failed to render PDF:', err);
      setError(errorText);
    },
    [errorText]
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex flex-col items-center gap-4 p-4"
      >
        {error ? (
          <div className="text-zinc-400 text-sm self-center">{error}</div>
        ) : loadingPdf || !pdfUrl ? (
          <div className="text-zinc-400 text-sm py-10">{loadingText}</div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="text-zinc-400 text-sm py-10">{loadingText}</div>
            }
          >
            {containerWidth > 0 &&
              Array.from({ length: numPages || 0 }, (_, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    pageRefs.current[i] = el;
                  }}
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

export default PdfViewer;
