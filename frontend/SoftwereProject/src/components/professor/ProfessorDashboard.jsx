import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../App.css';
import ProfessorAttendance from './ProfessorAttendance';
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
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
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
    <div className="professor-dashboard">

      <div className="create-schedule">
        <h2>Create New Class Schedule</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              value={newSchedule.className}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, className: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="section">Section</label>
            <input
              type="text"
              id="section"
              value={newSchedule.section}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, section: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="day">Day</label>
            <select
              id="day"
              value={newSchedule.schedule.day}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  schedule: { ...newSchedule.schedule, day: e.target.value },
                })
              }
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
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
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
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
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
                required
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            Create Schedule
          </button>
        </form>
      </div>

      <div className="schedules-list">
        <h2>My Class Schedules</h2>
        {schedules.map((schedule) => (
          <div key={schedule._id} className="schedule-item">
            <h3>{schedule.className}</h3>
            <p>Section: {schedule.section}</p>
            <p>
              Schedule: {schedule.schedule.day} {schedule.schedule.startTime} -{' '}
              {schedule.schedule.endTime}
            </p>
            <div className="enrolled-students">
              <h4>Enrolled Students:</h4>
              <ul>
                {schedule.students.map((student) => (
                  <li key={student._id}>
                    {student.firstName} {student.lastName}
                  </li>
                ))}
              </ul>
            </div>
            <StudentList
              scheduleId={schedule._id}
              currentStudents={schedule.students}
              onUpdate={fetchSchedules}
            />
          </div>
        ))}
      </div>

      <div className="attendance-section">
        <h2>Manage Attendance</h2>
        <ProfessorAttendance/>
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
      setAllStudents(response.data);
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
    <div className="student-list">
      <h3>Manage Students</h3>
      <form onSubmit={handleSubmit}>
        <div className="student-list-container">
          {allStudents.map((student) => (
            <div key={student._id} className="student-item">
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
              />
              <label htmlFor={student._id}>
                {student.firstName} {student.lastName} - {student.section}
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="update-btn">
          Update Students
        </button>
      </form>
    </div>
  );
};

export default ProfessorDashboard;