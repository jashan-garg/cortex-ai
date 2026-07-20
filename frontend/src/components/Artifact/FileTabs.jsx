const FileTabs = ({ files, activeFile, onSelect }) => {
  return (
    <div className="flex border-b border-zinc-800 overflow-x-auto">
      {files?.map((f, index) => (
        <button
          key={f.name}
          onClick={() => onSelect(index)}
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
  );
};

export default FileTabs;
