import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon, X } from "lucide-react";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      setError("Failed to fetch students");
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/api/admin/student/${editingStudent._id}`,
        editingStudent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Student updated successfully");
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to update student");
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(
          `http://localhost:3000/api/admin/student/${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Student deleted successfully");
        fetchStudents();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Student Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage student information and records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Section
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.userId.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.section}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="mr-2 inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <PencilIcon className="mr-1.5 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Edit Student</h3>
              <button
  onClick={() => setEditingStudent(null)}
  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
>
  <X className="h-6 w-6" /> {/* Use X instead of XMarkIcon */}
</button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={editingStudent.firstName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={editingStudent.lastName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="section"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Section
                </label>
                <input
                  id="section"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={editingStudent.section}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      section: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;