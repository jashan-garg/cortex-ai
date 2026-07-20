import { Code2, FileText, Presentation } from 'lucide-react';

export const artifactIcon = (type) => {
  if (type === 'PDF') return FileText;
  if (type === 'PPT') return Presentation;
  return Code2;
};

export const artifactLabel = (a) => {
  if (a.type === 'PDF') return 'PDF';
  if (a.type === 'PPT') return 'Presentation';
  const count = a.files?.length || 0;
  return `Code · ${count} file${count === 1 ? '' : 's'}`;
};

export const detectLanguage = (fileName = '') => {
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
