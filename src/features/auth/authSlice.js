import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Updated path

const initialState = {
  user: null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.status = 'loading';
    },
    loginSuccess: (state, action) => {
      state.status = 'succeeded';
      state.user = {
        token: action.payload.token,
        user: action.payload.user
      };
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
    },
    resetAuthState: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      // ✅ Update the nested user data (NOT the token)
      if (state.user) {
        state.user.user = action.payload;
      }
    });
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, resetAuthState } = authSlice.actions;

// LOGIN
export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await axios.post('/api/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    dispatch(loginSuccess({
      token: response.data.token,
      user: response.data.user
    }));
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.error || 'Login failed'));
  }
};

// REGISTER
export const register = (userData) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await axios.post('/api/auth/register', userData);
    dispatch(loginSuccess({
      token: response.data.token,
      user: response.data.user
    }));
    localStorage.setItem('token', response.data.token);
  } catch (error) {
    const errorMessage = error.response?.data?.error ||
                         error.message ||
                         'Registration failed';
    dispatch(loginFailure(errorMessage));
  }
};

// LOAD USER FROM LOCAL TOKEN
export const loadUser = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch(loginSuccess({
      token,
      user: response.data
    }));
  } catch (error) {
    localStorage.removeItem('token');
    dispatch(logout());
  }
};

// ASYNC FETCH CURRENT USER
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user.token;
      const response = await axios.get('/api/auth/me', {
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

export default authSlice.reducer;
