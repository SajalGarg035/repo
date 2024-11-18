import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Lock, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(credentials.username, credentials.password);
      toast.success('Login successful!');
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'professor') navigate('/professor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: 'url("https://rmch.in/wp-content/uploads/2023/03/digital-composite-doctor-with-white-graph-with-flare-against-blurry-background-with-light-blue-overlay-scaled-1906x624.jpg")',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 relative animate-fadeIn">
        {/* Header Section */}
        <div className="text-center space-y-2 animate-slideDown">
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Welcome Back
          </h2>
          <p className="text-gray-600" style={{ fontFamily: '"Inter", sans-serif' }}>
            Please sign in to your account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Field */}
            <div className="animate-slideRight">
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-1"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                    bg-white/50 backdrop-blur-sm text-gray-900 transition-all
                    hover:border-indigo-300"
                  required
                  style={{ fontFamily: '"Inter", sans-serif' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-slideLeft">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                    bg-white/50 backdrop-blur-sm text-gray-900 transition-all
                    hover:border-indigo-300"
                  required
                  style={{ fontFamily: '"Inter", sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm text-gray-700"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a 
                href="/ForgotPassword" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent 
              rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-indigo-500 transition-all duration-200 animate-pulse
              disabled:opacity-70 disabled:cursor-not-allowed
              transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div 
          className="text-center text-sm animate-fadeIn"
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <a 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors
              hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;