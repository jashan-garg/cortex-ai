import axios from 'axios';
import { graph } from '../graph/graph.js';
import { addMessage } from '../config/memory.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3.js';
import { Readable } from 'stream';

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req.headers['x-user-id'];
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: 'user',
      content: prompt,
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
    });

    await addMessage(conversationId, 'user', prompt);
    await addMessage(conversationId, 'assistant', result.aiResponse);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: 'assistant',
      content: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
    });

    return res.status(200).json({
      answer: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
      credits: result?.credits,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getPdf = async (req, res) => {
  try {
    const { key } = req.params;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const data = await s3.send(command);
    if (!data.Body) return res.status(404).send('File not found');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    if (data.ContentLength) res.setHeader('Content-Length', data.ContentLength);

    const stream = Readable.from(data.Body);
    stream.on('error', (err) => console.error('Stream error:', err));
    stream.on('end', () => console.log('Stream ended'));
    stream.pipe(res);
  } catch (err) {
    console.error('PDF fetch failed:', err);
    res.status(500).send('Failed to fetch PDF');
  }
};

export const getPpt = async (req, res) => {
  try {
    const { key } = req.params;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const data = await s3.send(command);
    if (!data.Body) return res.status(404).send('File not found');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );

    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    if (data.ContentLength) res.setHeader('Content-Length', data.ContentLength);

    const stream = Readable.from(data.Body);
    stream.on('error', (err) => console.error('Stream error:', err));
    stream.on('end', () => console.log('PPT stream ended'));
    stream.pipe(res);
  } catch (err) {
    console.error('PPT fetch failed:', err);
    res.status(500).send('Failed to fetch PPT');
  }
};
