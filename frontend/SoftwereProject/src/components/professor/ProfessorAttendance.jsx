'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLoading } from '../../context/LoadingContext'
import axios from 'axios'
import '../../App.css';

export default function ProfessorAttendance() {
  const [schedules, setSchedules] = useState([]); // Ensure it's an array
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const { token } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchProfessorSchedules = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/professor/schedules', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Ensure response data is an array, or set it to empty array
        setSchedules(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch professor schedules:', error);
        toast.error('Failed to fetch professor schedules');
        setSchedules([]); // Set to empty array on failure
      } finally {
        setLoading(false);
      }
    };
    fetchProfessorSchedules();
  }, [token, setLoading]);

  const handleScheduleSelect = async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      const response = await axios.get(`http://localhost:5000/api/professor/schedule/${schedule._id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentsData = response.data.students;
      setStudents(studentsData);
      setAttendance(
        studentsData.map((student) => ({
          studentId: student._id,
          present: false,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch students for the selected schedule:', error);
      toast.error('Failed to fetch students for the selected schedule');
    }
  };

  const handleAttendanceChange = (index) => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((item, idx) =>
        idx === index ? { ...item, present: !item.present } : item
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/professor/schedule/${selectedSchedule._id}/attendance`,
        { attendance },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance');
    }
  };

  return (
    <div className="professor-attendance">
      <h1 className="page-title">Professor Attendance</h1>
      <div className="class-selection">
        <h2 className="section-title">Select a Class</h2>
        {schedules.length === 0 ? (
          <p>Loading schedules...</p>
        ) : (
          <div className="schedule-grid">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className={`schedule-card ${selectedSchedule?._id === schedule._id ? 'selected' : ''}`}
                onClick={() => handleScheduleSelect(schedule)}
              >
                <h3 className="class-name">{schedule.className}</h3>
                <p className="section-info">Section: {schedule.section}</p>
                <p className="schedule-info">
                  Schedule: {schedule.schedule.day} {schedule.schedule.startTime} - {schedule.schedule.endTime}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSchedule && (
        <div className="attendance-section">
          <h2 className="section-title">
            Attendance for {selectedSchedule.className} - Section {selectedSchedule.section}
          </h2>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={attendance[index]?.present}
                      onChange={() => handleAttendanceChange(index)}
                      className="attendance-checkbox"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-btn" onClick={handleSaveAttendance}>
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}
