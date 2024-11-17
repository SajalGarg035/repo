import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Book, 
  Search, 
  Sun,
  Moon,
  Settings,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Theme initialization from localStorage
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setIsDark(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    setShowSearch(false);
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-600 dark:bg-blue-700 text-white' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
          } font-medium text-sm flex items-center gap-2`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Book className="h-8 w-8 text-blue-500" />
              <span className="font-['Poppins'] text-gray-900 dark:text-white font-bold text-xl">
                Student MS
                <span className="text-blue-500">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun size={20} className="text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

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
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                    >
                      <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        2
                      </span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <p className="text-sm text-gray-900 dark:text-white">New assignment posted</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <p className="text-sm text-gray-900 dark:text-white">Grade updated</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 dark:text-gray-300 font-['Inter']">
                      Welcome, <span className="font-semibold text-blue-500">{user.username}</span>
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
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar (Conditional Render) */}
        {showSearch && (
          <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-lg p-4">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900">
          {/* Search in mobile menu */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Theme toggle in mobile menu */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User size={20} className="mr-2" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'student' && (
                <Link
                  to="/student/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Student Dashboard
                </Link>
              )}
              {user.role === 'professor' && (
                <Link
                  to="/professor/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Professor Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="px-3 py-2 text-gray-700 dark:text-gray-300 font-['Inter']">
                Welcome, {user.username}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} className="mr-2" />
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