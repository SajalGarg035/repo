import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Alert, AlertDescription } from "../ui/Alert";
import {
  Calendar,
  Clock,
  Users,
  Book,
  Plus,
  Layout,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import ProfessorAttendance from './ProfessorAttendance';
import QRAttendanceManager from './QRAttendanceManager';
import { toast } from 'react-toastify';
import axios from 'axios';

// Create a Stats Card Component for the Dashboard (Moved up for clarity)
const StatsCard = ({ icon: Icon, title, value, trend }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Create a Schedule Summary Component (Moved up for clarity)
const ScheduleSummary = ({ schedules }) => {
  const today = new Date();
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Ensure schedules is an array before filtering
  const todaySchedules = Array.isArray(schedules) ? schedules.filter(
    schedule => schedule.schedule.day === currentDay
  ) : [];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaySchedules.length > 0 ? (
            todaySchedules.map((schedule) => (
              <div 
                key={schedule._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Book size={16} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{schedule.className}</p>
                    <p className="text-sm text-gray-600">Section {schedule.section}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {schedule.schedule.startTime} - {schedule.schedule.endTime}
                </div>
              </div>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                No classes scheduled for today
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Create Quick Actions Component (Moved up for clarity)
const QuickActions = ({ setActiveTab }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('attendance')}
            className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Users className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm">Take Attendance</span>
          </button>
          <button 
            onClick={() => setActiveTab('qr-attendance')}
            className="p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors"
          >
            <QrCode className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm">QR Attendance</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// Add these components to the Dashboard tab content (Moved up for clarity)
const DashboardContent = ({ schedules, setActiveTab }) => {
  // Ensure schedules is an array before reducing or filtering
  const totalStudents = Array.isArray(schedules) ? schedules.reduce((acc, curr) => acc + (curr.students?.length || 0), 0) : 0;
  const activeClasses = Array.isArray(schedules) ? schedules.length : 0;
  const classesToday = Array.isArray(schedules) ? schedules.filter(s => s.schedule.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length : 0;
  const hoursThisWeek = activeClasses * 3; // Assuming 3 hours per class, adjust as needed

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          title="Total Students"
          value={totalStudents}
          trend={2.5} // Example trend, replace with actual data if available
        />
        <StatsCard
          icon={Book}
          title="Active Classes"
          value={activeClasses}
          trend={0} // Example trend
        />
        <StatsCard
          icon={Calendar}
          title="Classes Today"
          value={classesToday}
        />
        <StatsCard
          icon={Clock}
          title="Hours This Week"
          value={hoursThisWeek} // Example calculation
          trend={1.2} // Example trend
        />
      </div>

      {/* Schedule Summary and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScheduleSummary schedules={schedules} />
        </div>
        <div>
          <QuickActions setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

const ProfessorDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newSchedule, setNewSchedule] = useState({
    className: '',
    section: '',
    schedule: {
      day: '',
      startTime: '',
      endTime: '',
    },
  });
  const { token } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    fetchSchedules();
  }, [token]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/professor/schedules',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Access the schedules array from the response object
      if (response.data && Array.isArray(response.data.schedules)) {
        setSchedules(response.data.schedules);
      } else {
        console.error("API did not return valid schedule data:", response.data);
        setSchedules([]); // Default to empty array if not an array
        toast.error('Received invalid schedule data format');
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error('Failed to fetch schedules');
      setSchedules([]); // Default to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/professor/schedule',
        newSchedule,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Schedule created successfully');
      fetchSchedules();
      setNewSchedule({
        className: '',
        section: '',
        schedule: {
          day: '',
          startTime: '',
          endTime: '',
        },
      });
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  const SidebarLink = ({ icon: Icon, text, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        active 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      {sidebarOpen && <span>{text}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
          
          <div className="flex-1 py-4">
            <SidebarLink 
              icon={Layout} 
              text="Dashboard" 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <SidebarLink 
              icon={Calendar} 
              text="Schedule" 
              active={activeTab === 'schedule'}
              onClick={() => setActiveTab('schedule')}
            />
            <SidebarLink 
              icon={Users} 
              text="Manual Attendance" 
              active={activeTab === 'attendance'}
              onClick={() => setActiveTab('attendance')}
            />
            <SidebarLink 
              icon={QrCode} 
              text="QR Attendance" 
              active={activeTab === 'qr-attendance'}
              onClick={() => setActiveTab('qr-attendance')}
            />
          </div>

          <div className="border-t p-4">
            <SidebarLink icon={Settings} text="Settings" />
            <SidebarLink icon={LogOut} text="Logout" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Background Image */}
        <div 
          className="fixed top-0 left-0 w-full h-64 z-0"
          style={{
            backgroundImage: 'url("/api/placeholder/1920/400")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.1'
          }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your classes and student attendance</p>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Dashboard Content (Stats, Summary, Actions) */}
              <DashboardContent schedules={schedules} setActiveTab={setActiveTab} />

              {/* Create Schedule Form and Class List */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Create Schedule Form */}
                <Card className="shadow-lg xl:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus size={20} />
                      Create New Class
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Class Name
                        </label>
                        <input
                          type="text"
                          value={newSchedule.className}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, className: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Section
                        </label>
                        <input
                          type="text"
                          value={newSchedule.section}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, section: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Day
                        </label>
                        <select
                          value={newSchedule.schedule.day}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              schedule: { ...newSchedule.schedule, day: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={newSchedule.schedule.startTime}
                            onChange={(e) =>
                              setNewSchedule({
                                ...newSchedule,
                                schedule: {
                                  ...newSchedule.schedule,
                                  startTime: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={newSchedule.schedule.endTime}
                            onChange={(e) =>
                              setNewSchedule({
                                ...newSchedule,
                                schedule: {
                                  ...newSchedule.schedule,
                                  endTime: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Create Schedule
                      </button>
                    </form>
                  </CardContent>
                </Card>

                {/* Class Schedules List */}
                <div className="xl:col-span-2 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} />
                    My Class Schedules
                  </h2>
                  
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Ensure schedules is an array before mapping */}
                    {Array.isArray(schedules) && schedules.length > 0 ? (
                      schedules.map((schedule) => (
                        <Card key={schedule._id} className="shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Book size={20} />
                                {schedule.className}
                              </div>
                              <span className="text-sm font-normal text-gray-500">
                                Section: {schedule.section}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={16} />
                                <span>
                                  {schedule.schedule.day} {schedule.schedule.startTime} -{' '}
                                  {schedule.schedule.endTime}
                                </span>
                              </div>

                              <div className="border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
                                  <Users size={16} />
                                  Enrolled Students
                                </h4>
                                <div className="max-h-40 overflow-y-auto">
                                  {/* Ensure schedule.students is an array */}
                                  {Array.isArray(schedule.students) && schedule.students.length > 0 ? (
                                    <ul className="space-y-1">
                                      {schedule.students.map((student) => (
                                        <li
                                          key={student._id}
                                          className="text-sm text-gray-600"
                                        >
                                          {student.firstName} {student.lastName}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <Alert>
                                      <AlertDescription>
                                        No students enrolled yet
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <StudentList
                                scheduleId={schedule._id}
                                currentStudents={schedule.students || []} // Pass empty array if undefined
                                onUpdate={fetchSchedules}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Alert className="lg:col-span-2">
                        <AlertDescription>
                          {/* Adjust message based on loading state if needed */}
                          No schedules found or still loading...
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Manual Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfessorAttendance />
              </CardContent>
            </Card>
          )}

          {activeTab === 'qr-attendance' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>QR Code Attendance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <QRAttendanceManager />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentList = ({ scheduleId, currentStudents, onUpdate }) => {
  const [allStudents, setAllStudents] = useState([]);
  // Ensure currentStudents is an array before mapping
  const [selectedStudents, setSelectedStudents] = useState(
    Array.isArray(currentStudents) ? currentStudents.map((student) => student._id) : []
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/professor/students", // Changed from admin to professor
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Check if the response has a students array property or is directly an array
      if (Array.isArray(response.data)) {
        setAllStudents(response.data);
      } else if (response.data && Array.isArray(response.data.students)) {
        setAllStudents(response.data.students);
      } else {
        console.error("API did not return valid student data:", response.data);
        setAllStudents([]); // Default to empty array
        toast.error("Received invalid student data format");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to fetch students");
      setAllStudents([]); // Default to empty array on error
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/professor/schedule/${scheduleId}/students`,
        { students: selectedStudents },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Students updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update students");
    }
  };

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
      >
        <span>Manage Students</span>
        <ChevronDown
          size={16}
          className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <form onSubmit={handleSubmit}>
          <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
            {/* Ensure allStudents is an array before mapping */}
            {Array.isArray(allStudents) && allStudents.length > 0 ? (
              allStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                >
                  <input
                    type="checkbox"
                    id={`student-${scheduleId}-${student._id}`} // More unique ID
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student._id]);
                      } else {
                        setSelectedStudents(
                          selectedStudents.filter((id) => id !== student._id)
                        );
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`student-${scheduleId}-${student._id}`} // Match unique ID
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {student.firstName} {student.lastName} - {student.section}
                  </label>
                </div>
              ))
            ) : (
              <Alert>
                <AlertDescription>
                  No students available to add or still loading...
                </AlertDescription>
              </Alert>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Update Students
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfessorDashboard;