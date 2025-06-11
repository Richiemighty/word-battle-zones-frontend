import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import socketReducer from '../features/socket/socketSlice';
import friendsReducer from '../features/friends/friendsSlice';
import searchReducer from '../features/search/searchSlice';
import friendRequestsReducer from '../features/friendRequests/friendRequestsSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    friends: friendsReducer,
    search: searchReducer,
    // friends: friendsReducer,
    friendRequests: friendRequestsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates']
      }
    })
});