import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(credentials.username, credentials.password);
      toast.success('Login successful!');
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'professor') navigate('/professor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (

    <div className="login-container">
      
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p className="forgot-password">
          <a href="#">Forgot your password?</a>
        </p>
      </div>
    </div>
  );
};

export default Login;