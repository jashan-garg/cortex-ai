import Editor from '@monaco-editor/react';
import { detectLanguage } from './utils.js';

const CodeEditor = ({ fileName, content }) => {
  return (
    <Editor
      theme="vs-dark"
      language={detectLanguage(fileName || '')}
      value={content || ''}
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
  );
};

export default CodeEditor;
