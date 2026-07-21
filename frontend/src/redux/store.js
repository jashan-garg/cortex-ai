import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import conversationReducer from './conversationSlice.js';
import messageReducer from './messageSlice.js';
import { injectStore } from '../../utils/axios.js';

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messageReducer,
  },
});

injectStore(store);
