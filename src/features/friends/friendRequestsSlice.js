import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const respondToFriendRequest = createAsyncThunk(
  'friendRequests/respondToFriendRequest',
  async ({ requestId, action }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/friend-requests/respond`,
        { requestId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const friendRequestsSlice = createSlice({
  name: 'friendRequests',
  initialState: {
    incomingRequests: [],
    requestStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(respondToFriendRequest.fulfilled, (state, action) => {
      state.incomingRequests = state.incomingRequests.filter(
        (req) => req._id !== action.payload.requestId
      );
    });
  },
});

export default friendRequestsSlice.reducer;
