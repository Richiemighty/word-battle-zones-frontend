import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchCurrentUser } from '../auth/authSlice';

// Fetch friend requests
export const fetchFriendRequests = createAsyncThunk(
  'friendRequests/fetchFriendRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/friend-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Respond to a request
export const respondToFriendRequest = createAsyncThunk(
  'friendRequests/respondToFriendRequest',
  async ({ requestId, action }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.user.token;
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/friend-requests/respond`,
        { requestId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // ✅ Refresh user data to get updated friends list
      dispatch(fetchCurrentUser());

      return { requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const friendRequestsSlice = createSlice({
  name: 'friendRequests',
  initialState: {
    requests: [],
    incomingRequests: [], // ✅ Add this
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriendRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.requests = action.payload;
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        // Remove the handled request from incomingRequests
        state.incomingRequests = state.incomingRequests.filter(
          req => req._id !== action.payload.requestId
        );
      });
  },
});

export default friendRequestsSlice.reducer;
