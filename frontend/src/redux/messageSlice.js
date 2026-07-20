import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    messages: [],
    artifacts: [],
    draft: '',
    panelCollapsed: false,
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
    setArtifacts: (state, action) => {
      state.artifacts = action.payload;
    },
    setPanelCollapsed: (state, action) => {
      state.panelCollapsed = action.payload;
    },
    openArtifactPanel: (state, action) => {
      state.artifacts = action.payload;
      state.panelCollapsed = false;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setDraft,
  setArtifacts,
  setPanelCollapsed,
  openArtifactPanel,
} = messageSlice.actions;
export default messageSlice.reducer;
