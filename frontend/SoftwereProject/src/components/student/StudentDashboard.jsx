import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { 
  Calendar, Clock, User, Book, CheckCircle, XCircle, Edit, Info, List, Menu, X, QrCode 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import ProfileEdit from './ProfileEdit';
import QRAttendanceScanner from './QRAttendanceScanner';

const StudentDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const { token } = useAuth();
  const { setLoading } = useLoading();
  
  // New state for managing sidebar and active section
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setSchedules(data.schedules);
        setStudentInfo(data.student);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token, setLoading]);

  const handleProfileUpdate = (updatedStudent) => {
    setStudentInfo(updatedStudent);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
          bg-white shadow-lg transition-all duration-300 ease-in-out
          fixed left-0 top-0 h-full z-40
        `}
      >
        <div className="relative p-4">
          <img
            src="https://images.shiksha.com/mediadata/images/1502278055phpGYzaMY.jpeg"
            alt="Banner"
            className="w-full h-32 object-cover opacity-50"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-25"></div>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveSection('profile')}
                className={`
                  w-full flex items-center p-2 
                  ${activeSection === 'profile' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-200'}
                  rounded-lg
                `}
              >
                <Edit className="w-5 h-5 mr-3" />
                Edit Profile
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('classes')}
                className={`
                  w-full flex items-center p-2 
                  ${activeSection === 'classes' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-200'}
                  rounded-lg
                `}
              >
                <List className="w-5 h-5 mr-3" />
                Classes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('qr-attendance')}
                className={`
                  w-full flex items-center p-2 
                  ${activeSection === 'qr-attendance' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-200'}
                  rounded-lg
                `}
              >
                <QrCode className="w-5 h-5 mr-3" />
                QR Attendance
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('details')}
                className={`
                  w-full flex items-center p-2 
                  ${activeSection === 'details' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-200'}
                  rounded-lg
                `}
              >
                <Info className="w-5 h-5 mr-3" />
                User Details
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="
          fixed top-4 left-4 z-50 bg-white shadow-md 
          rounded-full p-2 hover:bg-gray-100 
          transition-all duration-300
        "
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Main content */}
      <div 
        className={`
          flex-1 py-8 px-6 lg:px-8 
          transition-all duration-300 
          ${isSidebarOpen ? 'ml-64' : 'ml-0'}
        `}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {studentInfo?.firstName}!</p>
        </div>

        {/* Conditional Rendering based on Active Section */}
        {activeSection === 'profile' && studentInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={studentInfo.photo}
                        alt="Student"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {studentInfo.firstName} {studentInfo.lastName}
                    </h3>
                    <p className="text-gray-500">Section {studentInfo.section}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Enrolled: {new Date(studentInfo.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ProfileEdit studentInfo={studentInfo} onUpdate={handleProfileUpdate} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Class Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">{schedule.className}</h3>
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {schedule.section}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{schedule.professorId.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {schedule.schedule.day} {schedule.schedule.startTime} - {schedule.schedule.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {studentInfo?.attendance
                        ?.filter((attendance) => attendance.classId._id === schedule._id)
                        .map((attendance) => (
                          <div
                            key={attendance._id}
                            className="p-3 flex items-center justify-between border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              {attendance.present ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className="text-gray-600">
                                {new Date(attendance.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                attendance.present
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attendance.present ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'qr-attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRAttendanceScanner />
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'details' && studentInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  User Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 font-medium">First Name</p>
                      <p className="text-gray-900">{studentInfo.firstName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Last Name</p>
                      <p className="text-gray-900">{studentInfo.lastName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900">{studentInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Section</p>
                    <p className="text-gray-900">{studentInfo.section}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Enrollment Date</p>
                    <p className="text-gray-900">
                      {new Date(studentInfo.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;