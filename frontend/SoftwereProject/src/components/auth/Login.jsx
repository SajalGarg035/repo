import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-toastify';
import { Lock, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://www.hindustantimes.com/ht-img/img/2023/05/30/1600x900/The-IIITA-campus-in-Prayagraj--HT-File-Photo-_1685454167208.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 border border-gray-200/30">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm">
            Sign in to access your account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a 
                href="/ForgotPassword" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
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
              rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 transition-all duration-200
              disabled:opacity-70 disabled:cursor-not-allowed
              transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <a 
            href="/register" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors
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