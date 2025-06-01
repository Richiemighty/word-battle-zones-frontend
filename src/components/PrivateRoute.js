import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user, status } = useSelector(state => state.auth);
  const location = useLocation();
  
  console.log('PrivateRoute - auth state:', { user, status }); // Debug log

  if (status === 'loading') {
    return <div>Loading...</div>; // Show loading state
  }

  return user ? children : <Navigate to="/auth" state={{ from: location }} replace />;
};

export default PrivateRoute;