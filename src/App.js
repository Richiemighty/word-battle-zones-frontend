import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;