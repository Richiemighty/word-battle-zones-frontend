import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socket: null,
  onlineUsers: [],
  gameInvites: []
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
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
    }
  }
});

export const { setSocket, setOnlineUsers, addGameInvite, removeGameInvite } = socketSlice.actions;
export default socketSlice.reducer;