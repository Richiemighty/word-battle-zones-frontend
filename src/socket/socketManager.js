// src/socket/socketManager.js
import io from 'socket.io-client';

let socket;

export const initializeSocket = (userId) => {
  socket = io(process.env.REACT_APP_API_URL); // your backend server
  socket.emit('user-online', userId);

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    socket.emit('user-offline', userId);
  });
};

export const getSocket = () => socket;
