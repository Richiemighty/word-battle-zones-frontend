// src/socket/socketManager.js
import io from 'socket.io-client';

let socket;

export const initializeSocket = (userId) => {
  socket = io('http://localhost:5000'); // your backend server
  socket.emit('user-online', userId);

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    socket.emit('user-offline', userId);
  });
};

export const getSocket = () => socket;
