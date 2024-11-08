import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ProfileEdit from './ProfileEdit';

const StudentDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSchedules(response.data.schedules);
        setStudentInfo(response.data.student);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      }
    };
    fetchDashboard();
  }, [token]);

  const handleProfileUpdate = (updatedStudent) => {
    setStudentInfo(updatedStudent);
  };

  return (
    <div className="container mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Student Information</h2>
          {studentInfo && (
            <div>
              <p className="text-gray-700 mb-2">
  Photo: <img src={studentInfo.photo} alt="Student photo" className="w-20 h-20 rounded-full" />
  photo: {studentInfo.photo}
</p>

              <p className="text-gray-700 mb-2">
                Name: {studentInfo.firstName} {studentInfo.lastName}
              </p>
              <p className="text-gray-700 mb-2">Section: {studentInfo.section}</p>
              <p className="text-gray-700 mb-2">
                Enrollment Date: {new Date(studentInfo.enrollmentDate).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <ProfileEdit studentInfo={studentInfo} onUpdate={handleProfileUpdate} />
              </div>
            </div>
          )}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Class Schedules</h2>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="bg-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">{schedule.className}</h3>
                <p className="text-gray-700 mb-1">Section: {schedule.section}</p>
                <p className="text-gray-700 mb-1">Professor: {schedule.professorId.username}</p>
                <p className="text-gray-700 mb-1">
                  Schedule: {schedule.schedule.day} {schedule.schedule.startTime} - {schedule.schedule.endTime}
                </p>
                <h4 className="text-medium font-medium mt-4">Attendance</h4>
                <div className="space-y-2">
                  {studentInfo?.attendance
                    ?.filter((attendance) => attendance.classId._id === schedule._id)
                    .map((attendance) => (
                      <div key={attendance._id} className="bg-white rounded-lg p-2 shadow-sm">
                        <p className="text-gray-700">
                          Date: {new Date(attendance.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                          Present: {attendance.present.toString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;