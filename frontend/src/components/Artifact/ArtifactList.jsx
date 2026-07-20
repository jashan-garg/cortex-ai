import { ChevronRight, Download, PanelRightClose } from 'lucide-react';
import { artifactIcon, artifactLabel } from './utils.js';

const ArtifactList = ({ artifacts, onSelect, onCollapse, onDownloadAll }) => {
  return (
    <>
      <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-3 shrink-0">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          onClick={onCollapse}
        >
          <PanelRightClose size={16} />
        </button>

        <span className="text-[13px] font-medium text-zinc-100 flex-1">
          Artifacts
        </span>

        {artifacts.length > 0 && (
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
          >
            <Download size={14} /> Download all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {artifacts.length === 0 ? (
          <div className="text-zinc-500 text-[13px] text-center py-10">
            No artifacts yet.
          </div>
        ) : (
          artifacts.map((a) => {
            const Icon = artifactIcon(a.type);
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-left"
              >
                <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                  <Icon size={15} className="text-zinc-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-zinc-100 truncate">
                    {a.title}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {artifactLabel(a)}
                  </div>
                </div>
                <ChevronRight size={15} className="text-zinc-600 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </>
  );
};

export default ArtifactList;
