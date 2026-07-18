import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    messages: [],
    draft: '',
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setDraft: (state, action) => {
      state.draft = action.payload;
    },
  },
});

export const { setMessages, addMessage, setDraft } = messageSlice.actions;
export default messageSlice.reducer;
