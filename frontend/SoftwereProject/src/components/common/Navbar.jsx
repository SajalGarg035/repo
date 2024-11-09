import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X, User, LogOut, Home, Book, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-blue-500 hover:text-white'
          } font-medium text-sm flex items-center gap-2`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Book className="h-8 w-8 text-blue-500" />
              <span className="text-white font-bold text-xl">
                Student MS
                <span className="text-blue-500">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NavLink to="/login">
                  <User size={18} />
                  Login
                </NavLink>
                <NavLink to="/register">Register</NavLink>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Role-based links */}
                {user.role === 'student' && (
                  <NavLink to="/student/dashboard">Student Dashboard</NavLink>
                )}
                {user.role === 'professor' && (
                  <NavLink to="/professor/dashboard">Professor Dashboard</NavLink>
                )}
                {user.role === 'admin' && (
                  <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
                )}

                {/* User Section */}
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-full hover:bg-gray-700 transition-colors relative"
                    >
                      <Bell size={20} className="text-gray-300" />
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        2
                      </span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {/* Notification Items */}
                          <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <p className="text-sm text-gray-900">New assignment posted</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <p className="text-sm text-gray-900">Grade updated</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">
                      Welcome, <span className="font-semibold text-blue-400">{user.username}</span>
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'student' && (
                <Link
                  to="/student/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Student Dashboard
                </Link>
              )}
              {user.role === 'professor' && (
                <Link
                  to="/professor/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Professor Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="px-3 py-2 text-gray-300">
                Welcome, {user.username}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
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