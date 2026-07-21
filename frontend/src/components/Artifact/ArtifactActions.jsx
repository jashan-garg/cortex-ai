import { useState } from 'react';
import { Copy, Check, Download, Code2, Eye } from 'lucide-react';

const ArtifactActions = ({
  fileContent,
  canPreview,
  tab,
  onTabChange,
  onDownload,
  isPDF,
  isPPT,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fileContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.log(error);
    }
  };

  const showCopy = !isPDF && !isPPT && tab === 'code';
  const showDownload = (!isPDF && !isPPT && tab === 'code') || isPDF || isPPT;

  return (
    <>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      )}

      {showDownload && (
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
        >
          <Download size={15} />
        </button>
      )}

      {canPreview && !isPDF && !isPPT && (
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => onTabChange('code')}
            className={`px-2.5 py-1 text-[11px] rounded-md ${
              tab === 'code'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Code2 size={15} />
          </button>

          <button
            onClick={() => onTabChange('preview')}
            className={`px-2.5 py-1 text-[11px] rounded-md ${
              tab === 'preview'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Eye size={15} />
          </button>
        </div>
      )}
    </>
  );
};

export default ArtifactActions;
