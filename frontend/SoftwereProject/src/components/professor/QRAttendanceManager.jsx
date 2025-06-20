import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
  QrCode, 
  Clock, 
  Users, 
  Play, 
  Square, 
  RefreshCw, 
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const QRAttendanceManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionDetails, setSessionDetails] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchSchedules();
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (currentSession && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCurrentSession(null);
            fetchActiveSessions();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentSession, timeRemaining]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/professor/schedules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(response.data.schedules || []);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/qr-attendance/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch active sessions');
    }
  };

  const createSession = async () => {
    if (!selectedSchedule || !sessionName.trim()) {
      toast.error('Please select a class and enter session name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/qr-attendance/session/create',
        {
          classScheduleId: selectedSchedule._id,
          sessionName: sessionName.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const session = response.data.session;
      setCurrentSession(session);
      setTimeRemaining(300); // 5 minutes
      setSessionName('');
      fetchActiveSessions();
      toast.success('QR attendance session created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/qr-attendance/session/${sessionId}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCurrentSession(null);
      fetchActiveSessions();
      toast.success('Session ended successfully');
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const viewSessionDetails = async (sessionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/qr-attendance/session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSessionDetails(response.data.session);
    } catch (error) {
      toast.error('Failed to fetch session details');
    }
  };

  const downloadReport = async (classScheduleId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/qr-attendance/report/${classScheduleId}?format=csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${classScheduleId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Create New Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Create QR Attendance Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedSchedule?._id || ''}
                onChange={(e) => {
                  const schedule = schedules.find(s => s._id === e.target.value);
                  setSelectedSchedule(schedule);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a class...</option>
                {schedules.map(schedule => (
                  <option key={schedule._id} value={schedule._id}>
                    {schedule.className} - {schedule.section}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Session Name</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Lecture 1, Lab Session"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={createSession}
                disabled={loading || !selectedSchedule || !sessionName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Create Session
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Active Session */}
      {currentSession && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Active Session: {currentSession.sessionName}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <button
                  onClick={() => endSession(currentSession.id)}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                >
                  <Square className="w-4 h-4" />
                  End Session
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                <div className="flex justify-center">
                  <img
                    src={currentSession.qrCodeImage}
                    alt="QR Code for Attendance"
                    className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Students can scan this QR code to mark attendance
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">{currentSession.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section:</span>
                    <span className="font-medium">{currentSession.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires At:</span>
                    <span className="font-medium">
                      {new Date(currentSession.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => viewSessionDetails(currentSession.id)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  View Live Attendance
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Sessions
            </div>
            <button
              onClick={fetchActiveSessions}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No active sessions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{session.sessionName}</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Class:</span>
                      <span>{session.className}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Section:</span>
                      <span>{session.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance:</span>
                      <span>{session.attendanceCount} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{new Date(session.expiresAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => viewSessionDetails(session.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => endSession(session.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-1 px-2 rounded text-sm hover:bg-red-700"
                    >
                      <Square className="w-3 h-3" />
                      End
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Attendance Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map(schedule => (
              <div key={schedule._id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{schedule.className}</h3>
                <p className="text-sm text-gray-600 mb-3">Section: {schedule.section}</p>
                <button
                  onClick={() => downloadReport(schedule._id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {sessionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Session Details</h2>
              <button
                onClick={() => setSessionDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Session Info</h3>
                <p className="text-sm text-blue-600">{sessionDetails.sessionName}</p>
                <p className="text-sm text-blue-600">{sessionDetails.className} - {sessionDetails.section}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Attendance</h3>
                <p className="text-2xl font-bold text-green-600">
                  {sessionDetails.presentStudents}/{sessionDetails.totalStudents}
                </p>
                <p className="text-sm text-green-600">
                  {Math.round((sessionDetails.presentStudents / sessionDetails.totalStudents) * 100)}% present
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Status</h3>
                <p className={`text-sm ${sessionDetails.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionDetails.isActive ? 'Active' : 'Ended'}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(sessionDetails.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Section</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Time Marked</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionDetails.attendanceRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{record.student.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{record.student.section}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(record.markedAt).toLocaleTimeString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRAttendanceManager;