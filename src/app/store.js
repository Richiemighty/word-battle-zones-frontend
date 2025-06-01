import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import socketReducer from '../features/socket/socketSlice';
import friendsReducer from '../features/friends/friendsSlice';


export default configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    friends: friendsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['socket.socket']
      }
    })
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    friends: friendsReducer, // ← add this
  },
});
