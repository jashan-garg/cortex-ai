const FileTabs = ({ files, activeFile, onSelect }) => {
  return (
    <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      {files?.map((f, index) => (
        <button
          key={f.name}
          onClick={() => onSelect(index)}
          className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] border-r border-zinc-800 last:border-r-0 transition-colors ${
            activeFile === index
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
};

export default FileTabs;
