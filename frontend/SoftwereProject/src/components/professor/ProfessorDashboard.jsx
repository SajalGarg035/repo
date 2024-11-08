import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Calendar, Clock, Users, Book, Plus } from 'lucide-react';
import { Alert, AlertDescription } from "../ui/Alert";
import { useAuth } from '../../context/AuthContext'; // Ensure this path points to the correct file
import ProfessorAttendance from './ProfessorAttendance'; // Adjust the path as necessary
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfessorDashboard = () => {
  const [schedules, setSchedules] = useState([]);
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

  useEffect(() => {
    fetchSchedules();
  }, [token]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/professor/schedules',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/api/professor/schedule',
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your classes and student attendance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Schedule Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} />
                Create New Class Schedule
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
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              My Class Schedules
            </h2>
            
            {schedules.map((schedule) => (
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
                        {schedule.students.length > 0 ? (
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
                      currentStudents={schedule.students}
                      onUpdate={fetchSchedules}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Manage Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessorAttendance />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StudentList = ({ scheduleId, currentStudents, onUpdate }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(
    currentStudents ? currentStudents.map((student) => student._id) : []
  );
  const { token } = useAuth();

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/admin/students",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const studentsArray = Array.isArray(response.data) ? response.data : [];
      setAllStudents(studentsArray);
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/api/professor/schedule/${scheduleId}/students`,
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
      <h3 className="text-sm font-medium text-gray-900 mb-3">Manage Students</h3>
      <form onSubmit={handleSubmit}>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
          {Array.isArray(allStudents) ? (
            allStudents.map((student) => (
              <div
                key={student._id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
              >
                <input
                  type="checkbox"
                  id={student._id}
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
                  htmlFor={student._id}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {student.firstName} {student.lastName} - {student.section}
                </label>
              </div>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                No students available
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
    </div>
  );
};

export default ProfessorDashboard;