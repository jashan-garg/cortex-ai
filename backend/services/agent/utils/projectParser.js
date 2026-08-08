const normalizeContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('');
  }
  return String(content || '');
};

const cleanJson = (content) => {
  const text = normalizeContent(content);
  const withoutFences = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  return firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFences.slice(firstBrace, lastBrace + 1)
    : withoutFences;
};

export const parseProject = (content) => {
  const project = JSON.parse(cleanJson(content));
  if (!Array.isArray(project.files) || project.files.length === 0) {
    throw new Error('Coding model returned no project files');
  }

  project.files.forEach((file) => {
    if (typeof file?.name !== 'string' || typeof file?.content !== 'string') {
      throw new Error('Coding model returned an invalid project file');
    }
  });

  return project;
};
