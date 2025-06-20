import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import { toast } from "react-toastify";
import {
  PencilIcon,
  TrashIcon,
  X,
  Mail,
  UserCircle,
  Users,
  LayoutDashboard,
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const { token } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    fetchStudents();
    fetchProfessors();
  }, [token]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/students", {
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

  const fetchProfessors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/professors_list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfessors(response.data);
    } catch (error) {
      setError("Failed to fetch professors");
      toast.error("Failed to fetch professors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/admin/student/${editingStudent._id}`,
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
          `http://localhost:5000/api/admin/student/${studentId}`,
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

  const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center space-x-2 rounded-lg px-4 py-3 text-left transition-colors ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4" />}
    </button>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="relative h-48 w-full overflow-hidden rounded-xl">
        <img
          src="https://images.shiksha.com/mediadata/images/1502278055phpGYzaMY.jpeg"
          alt="Campus"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white">
            Welcome to Admin Dashboard
          </h1>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Students</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {students.length}
                </p>
              </div>
              <UserCircle className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Total Professors
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-900">
                  {professors.length}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ProfessorsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Professors Directory</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {professors.map((professor) => (
          <Card key={professor._id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={professor.photo}
                alt={`${professor.username}'s photo`}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {professor.username}
              </h3>
              <div className="mt-2 flex items-center text-gray-600">
                <Mail className="mr-2 h-4 w-4" />
                {professor.email}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const StudentsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Students Directory</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student._id} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {student.firstName} {student.lastName}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {/* Add null check for userId and email */}
                  {student.userId && student.userId.email ? student.userId.email : "No email available"}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {/* Add null check for section */}
                Section {student.section || "N/A"}
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingStudent(student)}
                className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(student._id)}
                className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <SidebarLink
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarLink
            icon={Users}
            label="Professors"
            active={activeView === 'professors'}
            onClick={() => setActiveView('professors')}
          />
          <SidebarLink
            icon={GraduationCap}
            label="Students"
            active={activeView === 'students'}
            onClick={() => setActiveView('students')}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'professors' && <ProfessorsView />}
        {activeView === 'students' && <StudentsView />}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Edit Student</h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="rounded-full bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingStudent.firstName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      firstName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingStudent.lastName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      lastName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  // Add null check for userId and email
                  value={editingStudent.userId ? editingStudent.userId.email : ''}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      // Ensure userId exists before updating email
                      userId: editingStudent.userId ? { ...editingStudent.userId, email: e.target.value } : { email: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  // Consider making email read-only if it shouldn't be edited here
                  // readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Section
                </label>
                <input
                  type="text"
                  // Add null check for section
                  value={editingStudent.section || ''}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      section: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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