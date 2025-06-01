// features/friends/friendsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { getState }) => {
    const token = getState().auth.user.token;
    const response = await axios.get('/api/friends', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFriends.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default friendsSlice.reducer;
