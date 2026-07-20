import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axios.js';
import { addMessage, updateMessage } from './messageSlice.js';

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async ({ prompt, conversationId, agent }, { dispatch }) => {
    const userMsg = {
      _id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      images: [],
      artifacts: [],
    };
    dispatch(addMessage(userMsg));

    const assistantMsg = {
      _id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      images: [],
      artifacts: [],
    };
    dispatch(addMessage(assistantMsg));

    const { data } = await api.post('/api/agent/chat', {
      prompt,
      conversationId,
      agent,
    });

    dispatch(
      updateMessage({
        _id: assistantMsg._id,
        content: data.answer,
        images: data.images || [],
        artifacts: data.artifacts || [],
      })
    );

    return data;
  }
);
