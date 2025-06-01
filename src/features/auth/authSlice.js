import { createSlice } from '@reduxjs/toolkit';
// import axios from 'axios';
import axios from '../../api/axios';  // Updated path

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
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, resetAuthState } = authSlice.actions;


export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await axios.post('/api/auth/login', credentials);
    dispatch(loginSuccess(response.data));
    localStorage.setItem('token', response.data.token);
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.error || 'Login failed'));
  }
};

export const register = (userData) => async (dispatch) => {
    dispatch(loginStart());
    try {
      const response = await axios.post('/api/auth/register', userData);
      dispatch(loginSuccess(response.data));
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Registration failed';
      dispatch(loginFailure(errorMessage));
    }
  };
  
// Add this to your authSlice.js
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
export default authSlice.reducer;