/* eslint-disable react-hooks/static-components */
import { PanelRightClose, X } from 'lucide-react';
import { artifactIcon } from './utils.js';
import ArtifactActions from './ArtifactActions.jsx';

const ArtifactHeader = ({
  artifact,
  tab,
  onTabChange,
  onCollapse,
  onClose,
  onDownload,
  fileContent,
  canPreview,
}) => {
  const HeaderIcon = artifactIcon(artifact?.type);
  const isPDF = artifact?.type === 'PDF';
  const isPPT = artifact?.type === 'PPT';

  return (
    <div className="h-12 sm:h-14 px-3 sm:px-4 border-b border-zinc-800 flex items-center gap-2 sm:gap-3 shrink-0">
      <button
        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        onClick={onCollapse}
      >
        <PanelRightClose size={16} />
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md bg-zinc-800 border border-zinc-700">
          <HeaderIcon size={12} className="text-zinc-300" />
        </div>
        <div className="text-xs sm:text-[13px] font-medium text-zinc-100 truncate">
          {artifact?.title}
        </div>
      </div>

      <ArtifactActions
        fileContent={fileContent}
        canPreview={canPreview}
        tab={tab}
        onTabChange={onTabChange}
        onDownload={onDownload}
        isPDF={isPDF}
        isPPT={isPPT}
      />

      <button
        onClick={onClose}
        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ArtifactHeader;
