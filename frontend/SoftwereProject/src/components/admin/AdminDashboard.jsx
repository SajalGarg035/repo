'use client'

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  description: {
    color: '#666',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #eee',
    fontWeight: 'bold',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  button: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
  },
}

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [editingStudent, setEditingStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()

  useEffect(() => {
    fetchStudents()
  }, [token])

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:3000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStudents(response.data)
    } catch (error) {
      setError("Failed to fetch students")
      toast.error("Failed to fetch students")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(
        `http://localhost:3000/api/admin/student/${editingStudent._id}`,
        editingStudent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success("Student updated successfully")
      setEditingStudent(null)
      fetchStudents()
    } catch (error) {
      toast.error("Failed to update student")
    }
  }

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`http://localhost:3000/api/admin/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Student deleted successfully")
        fetchStudents()
      } catch (error) {
        toast.error("Failed to delete student")
      }
    }
  }

  if (isLoading) {
    return <div style={{ ...styles.container, textAlign: 'center' }}>Loading...</div>
  }

  if (error) {
    return <div style={{ ...styles.container, color: 'red', textAlign: 'center' }}>{error}</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Student Management</h2>
          <p style={styles.description}>Manage student information and records</p>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Section</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td style={styles.td}>{student.firstName} {student.lastName}</td>
                <td style={styles.td}>{student.userId.email}</td>
                <td style={styles.td}>{student.section}</td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.button, ...styles.editButton }}
                    onClick={() => setEditingStudent(student)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.deleteButton }}
                    onClick={() => handleDelete(student._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStudent && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ ...styles.title, marginBottom: '16px' }}>Edit Student</h3>
            <form onSubmit={handleEdit} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="firstName" style={styles.label}>First Name</label>
                <input
                  id="firstName"
                  style={styles.input}
                  value={editingStudent.firstName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="lastName" style={styles.label}>Last Name</label>
                <input
                  id="lastName"
                  style={styles.input}
                  value={editingStudent.lastName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="section" style={styles.label}>Section</label>
                <input
                  id="section"
                  style={styles.input}
                  value={editingStudent.section}
                  onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  style={{ ...styles.button, backgroundColor: '#ccc' }}
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...styles.button, ...styles.editButton }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}