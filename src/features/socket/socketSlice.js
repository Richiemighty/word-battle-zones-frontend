import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   isConnected: false,
//   socketId: null,
//   onlineUsers: [],
//   gameInvites: [],
//   currentGame: null
// };

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    isConnected: false,
    onlineUsers: []
  },
  reducers: {
    connectionEstablished: (state, action) => {
      state.isConnected = true;
      state.socketId = action.payload;
    },
    connectionLost: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addGameInvite: (state, action) => {
      state.gameInvites.push(action.payload);
    },
    removeGameInvite: (state, action) => {
      state.gameInvites = state.gameInvites.filter(
        invite => invite.id !== action.payload
      );
    },
    startGame: (state, action) => {
      state.currentGame = action.payload;
    },
    updateGame: (state, action) => {
      state.currentGame = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    }
  }
});




export const { 
  connectionEstablished, 
  connectionLost,
  setOnlineUsers,
  addGameInvite,
  removeGameInvite,
  startGame,
  updateGame,
  setConnected
} = socketSlice.actions;

export default socketSlice.reducer;