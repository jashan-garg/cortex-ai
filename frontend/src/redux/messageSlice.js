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

    updateMessage: (state, action) => {
      const { _id, ...updates } = action.payload;
      const idx = state.messages.findIndex((m) => m._id === _id);
      if (idx !== -1) {
        Object.assign(state.messages[idx], updates);
      }
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
  updateMessage,
  setDraft,
  setArtifacts,
  setPanelCollapsed,
  openArtifactPanel,
} = messageSlice.actions;

export default messageSlice.reducer;
