import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

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
        "http://localhost:5000/api/admin/students",
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
    <div className="mt-4">
      <h3 className="font-weight-medium mb-2">Manage Students</h3>
      <form onSubmit={handleSubmit}>
        <div className="max-height-60 overflow-y-auto border rounded p-2">
          {allStudents.map((student) => (
            <div key={student._id} className="form-check mb-2">
              <input
                className="form-check-input"
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
              <label className="form-check-label" htmlFor={student._id}>
                {student.firstName} {student.lastName} - {student.section}
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Update Students
        </button>
      </form>
    </div>
  );
};

export default StudentList;
