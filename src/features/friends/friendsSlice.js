// features/friends/friendsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user.token;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/friends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        if (Array.isArray(data)) {
          state.friends = data;
        } else if (data && Array.isArray(data.friends)) {
          state.friends = data.friends;
        } else {
          state.friends = [];
        }
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});


export const fetchFriendRequests = createAsyncThunk(
  'friendRequests/fetchFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token'); // or wherever you store it
      const response = await axios.get('/api/friends/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to load requests');
    }
  }
);

export const respondToRequest = createAsyncThunk(
  'friendRequests/respondToRequest',
  async ({ requestId, action }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/friends/requests/${requestId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to respond');
    }
  }
);

export default friendsSlice.reducer;

