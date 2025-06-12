import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, resetAuthState } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignInAlt, FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './AuthPage.css'; // We'll create this CSS file

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
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="auth-card"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="auth-header"
          whileHover={{ scale: 1.02 }}
        >
          <h2>
            {isLogin ? (
              <>
                <FaSignInAlt /> Login
              </>
            ) : (
              <>
                <FaUserPlus /> Register
              </>
            )}
          </h2>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label>
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={validationErrors.username ? 'error' : ''}
                />
                {validationErrors.username && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {validationErrors.username}
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label>
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? 'error' : ''}
            />
            {validationErrors.email && (
              <motion.span 
                className="error-text"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {validationErrors.email}
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label>
              <FaLock /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={validationErrors.password ? 'error' : ''}
            />
            {validationErrors.password && (
              <motion.span 
                className="error-text"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {validationErrors.password}
              </motion.span>
            )}
          </motion.div>

          <motion.button
            type="submit"
            className={`submit-btn ${status === 'loading' ? 'loading' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="spinner"
              >
                ⏳
              </motion.span>
            ) : isLogin ? (
              'Login'
            ) : (
              'Register'
            )}
          </motion.button>
        </form>

        <motion.div 
          className="switch-auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="switch-btn"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AuthPage;