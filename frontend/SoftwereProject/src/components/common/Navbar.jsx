import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-xl">
          Student Management System
        </Link>
        <div className="flex items-center">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'student' && (
                <Link to="/student/dashboard" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Student Dashboard
                </Link>
              )}
              {user.role === 'professor' && (
                <Link to="/professor/dashboard" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Professor Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin Dashboard
                </Link>
              )}
              <span className="text-gray-400 mr-3">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;