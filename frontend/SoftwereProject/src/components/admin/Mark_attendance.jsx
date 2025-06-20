import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarkAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Fetch Attendance Data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/get_attendance_json');
        console.log(response.data);
        setAttendanceData(response.data); // Assuming this data is in the correct format
      } catch (err) {
        setError('Failed to fetch attendance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Step 2: Handle Input Changes
  const handleInputChange = (index, event) => {
    const updatedData = [...attendanceData];
    updatedData[index][event.target.name] = event.target.value;
    setAttendanceData(updatedData);
  };

  const handleCheckboxChange = (index) => {
    const updatedData = [...attendanceData];
    updatedData[index].present = !updatedData[index].present;
    setAttendanceData(updatedData);
  };

  // Step 3: Submit Attendance Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Step 4: POST the updated attendance data to the server
      const response = await axios.get('http://localhost:5000/api/mark_attendance');
      console.log(response);
    } catch (err) {
      setError('Failed to submit attendance data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      {loading && <p>Loading attendance data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default MarkAttendance;
