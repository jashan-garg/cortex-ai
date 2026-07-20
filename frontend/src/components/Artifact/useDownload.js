import { useCallback } from 'react';
import api from '../../../utils/axios.js';

export const downloadTextFile = (targetFile) => {
  if (!targetFile?.content) return;
  const blob = new Blob([targetFile.content], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = targetFile.name || 'file.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};

export const downloadRemoteBlob = async (targetFile, endpoint) => {
  if (!targetFile?.content) return;

  const res = await api.get(`${endpoint}${targetFile.content}`, {
    responseType: 'blob',
  });
  const blob = res.data;
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = targetFile.name || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};

export const useDownloadHandlers = () => {
  const handleDownload = useCallback(async (artifact) => {
    const isPPT = artifact?.type === 'PPT';
    const isPDF = artifact?.type === 'PDF';

    try {
      if (isPPT) {
        const pptxFile =
          artifact?.files?.find((f) => f.name?.endsWith('.pptx')) ||
          artifact?.files?.[0];
        await downloadRemoteBlob(pptxFile, '/api/agent/get-ppt/');
      } else if (isPDF) {
        const viewFile =
          artifact?.files?.find((f) => f.name?.endsWith('.pdf')) ||
          artifact?.files?.[0];
        await downloadRemoteBlob(viewFile, '/api/agent/get-pdf/');
      } else {
        const file = artifact?.files?.[0];
        downloadTextFile(file);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleDownloadAll = useCallback(async (allArtifacts) => {
    for (const a of allArtifacts) {
      try {
        if (a.type === 'PPT') {
          const p =
            a?.files?.find((f) => f.name?.endsWith('.pptx')) || a?.files?.[0];
          await downloadRemoteBlob(p, '/api/agent/get-ppt/');
        } else if (a.type === 'PDF') {
          const p =
            a?.files?.find((f) => f.name?.endsWith('.pdf')) || a?.files?.[0];
          await downloadRemoteBlob(p, '/api/agent/get-pdf/');
        } else {
          a.files?.forEach(downloadTextFile);
        }
      } catch (error) {
        console.error(`Download failed for "${a.title}":`, error);
      }
    }
  }, []);

  return { handleDownload, handleDownloadAll };
};
