import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, resetAuthState } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
  const { status, error, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Reset auth state when switching between login/register
  useEffect(() => {
    dispatch(resetAuthState());
  }, [isLogin, dispatch]);

  // Redirect if user is authenticated
  useEffect(() => {
    if (user ) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !formData.username) {
      errors.username = 'Username is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isLogin) {
      await dispatch(login({ 
        email: formData.email, 
        password: formData.password 
      }));
    } else {
      await dispatch(register(formData));
    }
  };

  return (
    <div className="auth-container" style={{
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      {error && (
        <div className="error-message" style={{
          color: 'red',
          backgroundColor: '#ffebee',
          padding: '0.5rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: validationErrors.username ? '1px solid red' : '1px solid #ddd'
              }}
              required
            />
            {validationErrors.username && (
              <span style={{ color: 'red', fontSize: '0.8rem' }}>
                {validationErrors.username}
              </span>
            )}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: validationErrors.email ? '1px solid red' : '1px solid #ddd'
            }}
            required
          />
          {validationErrors.email && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {validationErrors.email}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: validationErrors.password ? '1px solid red' : '1px solid #ddd'
            }}
            required
          />
          {validationErrors.password && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {validationErrors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: status === 'loading' ? '#cccccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          {status === 'loading' ? (
            <span>Processing...</span>
          ) : isLogin ? (
            'Login'
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;