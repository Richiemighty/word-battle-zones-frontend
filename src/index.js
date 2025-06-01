import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import App from './App';
import './index.css';
// Add near the top of index.js
import { loadUser } from './features/auth/authSlice';

// Add after creating the store
store.dispatch(loadUser());

// Get the root element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);