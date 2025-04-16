import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/Resetpassword";
import StudentDashboard from "./components/student/StudentDashboard";
import ProfessorDashboard from "./components/professor/ProfessorDashboard";
import StudentList from "./components/professor/StudentList";
import AdminDashboard from "./components/admin/AdminDashboard";
import Navbar from "./components/common/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MarkAttendance from "./components/admin/Mark_attendance";
import LandingPage from "./components/common/initialpage";
import ResetPassword from "./components/auth/fuc";

const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Router>
          {/* Main Wrapper with Tailwind for min-height and background */}
          <div className="min-h-screen bg-gray-100 d-flex flex-column">
            <Navbar />
            <div className="">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    
                      <LandingPage />
                    
                  }
                />
                <Route
                  path="/student/dashboard"
                  element={
                    <PrivateRoute roles={["student"]}>
                      <StudentDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/professor/dashboard"
                  element={
                    <PrivateRoute roles={["professor"]}>
                      <ProfessorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/professor/student"
                  element={
                    <PrivateRoute roles={["professor"]}>
                      <StudentList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute roles={["admin"]}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route 
                  path = "/ForgotPassword"
                  element = {
                    <ForgotPassword></ForgotPassword>
                  }
                  />
                  <Route
                  path="/ResetPassword"
                  element = {
                    <ResetPassword></ResetPassword>
                  }
                  />
              </Routes>
            </div>
            {/* Toast notifications */}
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;
