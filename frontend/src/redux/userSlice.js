import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
  },
  reducers: {
    setUserdata: (state, action) => {
      state.user = action.payload;
    },
    setCredits: (state, action) => {
      if (state.user) {
        state.user.credits = action.payload;
      }
    },
  },
});

export const { setUserdata, setCredits } = userSlice.actions;
export default userSlice.reducer;
