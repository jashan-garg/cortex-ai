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
        clearUserdata: (state) => {
            state.user = null;
        },
    },
});

export const { setUserdata, clearUserdata } = userSlice.actions;
export default userSlice.reducer;
