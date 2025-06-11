import { io } from 'socket.io-client';
import store from '../app/store';
import { 
  connectionEstablished, 
  connectionLost,
  setOnlineUsers,
  addGameInvite
} from '../features/socket/socketSlice';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) return socket;

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: { token: localStorage.getItem('token') }
  });

  socket.on('connect', () => {
    store.dispatch(connectionEstablished(socket.id));
    socket.emit('join', userId);
  });

  socket.on('disconnect', () => {
    store.dispatch(connectionLost());
  });

  socket.on('onlineUsers', (users) => {
    store.dispatch(setOnlineUsers(users));
  });

  socket.on('gameInvite', (invite) => {
    store.dispatch(addGameInvite(invite));
  });

  return socket;
};

export const getSocket = () => socket;

export const emitGameUpdate = (gameData) => {
  if (socket) {
    socket.emit('gameUpdate', gameData);
  }
};