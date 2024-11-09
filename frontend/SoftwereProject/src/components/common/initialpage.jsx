import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <img 
            src="https://mba.iiita.ac.in/img/IIIT_logo_transparent.gif" 
            alt="IIIT Allahabad Logo" 
            className="w-28 h-28 mb-8 animate-bounce"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Smart Attendance System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Welcome to IIIT Allahabad's next-generation attendance tracking platform. 
            Seamless, accurate, and efficient attendance management.
          </p>
          <div className="space-x-4">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold 
              hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 
              flex items-center">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold 
              border-2 border-indigo-600 hover:bg-indigo-50 transform hover:scale-105 
              transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 
              transform hover:scale-105 transition-all duration-200">
              <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center 
                justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor attendance instantly with our advanced real-time tracking system
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 
              transform hover:scale-105 transition-all duration-200">
              <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center 
                justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Face Recognition</h3>
              <p className="text-gray-600">
                Advanced facial recognition for accurate and secure attendance marking
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 
              transform hover:scale-105 transition-all duration-200">
              <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center 
                justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Reports</h3>
              <p className="text-gray-600">
                Generate detailed attendance reports with just one click
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 IIIT Allahabad - Smart Attendance System</p>
          <div className="flex items-center justify-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-sm">Secure & Reliable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;