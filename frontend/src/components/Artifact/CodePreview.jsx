const CodePreview = ({ htmlFile, cssFile, jsFile }) => {
  const previewDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
        <style>${cssFile?.content || ''}</style>
      </head>
      <body>
        ${htmlFile?.content || ''}
        <script>${jsFile?.content || ''}</script>
      </body>
    </html>`;

  return (
    <iframe
      title="preview"
      srcDoc={previewDoc}
      sandbox="allow-scripts"
      className="w-full h-full bg-white"
    />
  );
};

export default CodePreview;
