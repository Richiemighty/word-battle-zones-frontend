// src/features/search/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';




export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/search?username=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);




export const sendFriendRequest = createAsyncThunk(
  'search/sendFriendRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.user?.token;

      const response = await axios.post(
        `/api/friends/request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error('🔴 Friend request failed:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    loading: false,
    error: null,
    requestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    requestError: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.error = null;
    },
    resetRequestStatus: (state) => {
      state.requestStatus = 'idle';
      state.requestError = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // Search Users reducers
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send Friend Request reducers
      .addCase(sendFriendRequest.pending, (state) => {
        state.requestStatus = 'loading';
        state.requestError = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.requestStatus = 'succeeded';
        // Update the specific user in results to show request was sent
        state.results = state.results.map(user => 
          user._id === action.payload.recipientId 
            ? { ...user, requestSent: true } 
            : user
        );
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.requestStatus = 'failed';
        state.requestError = action.payload;
      });
  },
});

export const { clearSearchResults, resetRequestStatus } = searchSlice.actions;
export default searchSlice.reducer;