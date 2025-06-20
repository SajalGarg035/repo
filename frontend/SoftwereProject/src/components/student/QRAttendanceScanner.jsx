import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin,
  Smartphone,
  History,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const QRAttendanceScanner = () => {
  const [qrData, setQrData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchAttendanceHistory();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/qr-attendance/student/history?limit=10',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAttendanceHistory(response.data.attendance.records);
      setAttendanceStats(response.data.attendance.statistics);
    } catch (error) {
      console.error('Failed to fetch attendance history');
    }
  };

  const markAttendance = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/qr-attendance/mark',
        {
          qrData: qrData.trim(),
          location
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(response.data.message);
      setQrData('');
      fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate camera scanning
    setTimeout(() => {
      setIsScanning(false);
      // In a real implementation, this would use a QR code scanner library
      toast.info('QR Scanner would open here. For demo, please paste QR data manually.');
    }, 2000);
  };

  const getAttendancePercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* QR Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Attendance Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Interface */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <Camera className="w-16 h-16 mx-auto text-blue-600 animate-pulse" />
                    <p className="text-gray-600">Scanning for QR code...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-gray-600">Click to scan QR code</p>
                    <button
                      onClick={simulateQRScan}
                      className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      <Camera className="w-4 h-4" />
                      Open Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Or paste QR code data manually:
                </label>
                <textarea
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Paste QR code data here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <button
                  onClick={markAttendance}
                  disabled={loading || !qrData.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark Attendance
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How to mark attendance:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Wait for professor to start session</p>
                    <p className="text-sm text-gray-600">Your professor will display a QR code during class</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Scan the QR code</p>
                    <p className="text-sm text-gray-600">Use the camera button or paste the code manually</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirm attendance</p>
                    <p className="text-sm text-gray-600">Your attendance will be marked automatically</p>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Device Information
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camera:</span>
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Statistics */}
      {attendanceStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Attendance Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {attendanceStats.totalPresent}
                </div>
                <div className="text-sm text-gray-600">Classes Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {attendanceStats.totalSessions}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getAttendancePercentageColor(attendanceStats.attendancePercentage)}`}>
                  {attendanceStats.attendancePercentage}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Attendance Progress</span>
                <span>{attendanceStats.attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    attendanceStats.attendancePercentage >= 80 ? 'bg-green-600' :
                    attendanceStats.attendancePercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{width: `${attendanceStats.attendancePercentage}%`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No attendance records yet</p>
              <p className="text-sm">Start scanning QR codes to see your attendance history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{record.sessionName}</p>
                      <p className="text-sm text-gray-600">
                        {record.className} - {record.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(record.markedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRAttendanceScanner;