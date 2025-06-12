import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage'; // ✅ Import your landing page
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* ✅ Landing page is shown first at "/" */}
        <Route path="/" element={<LandingPage />} />
        
        {/* ✅ Login or registration */}
        <Route path="/auth" element={<AuthPage />} />

        {/* ✅ Protected dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />

        {/* ✅ Wildcard route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

