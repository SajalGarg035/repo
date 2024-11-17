import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Calendar, Upload, UserCircle } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'student',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [photo, setPhoto] = useState(null); // Separate state for file
  const [photoPreview, setPhotoPreview] = useState(null); // For image preview

  const { register } = useAuth();
  // const {uploads} = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Create preview URL
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const file = e.target.files[0];
    try {
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append file separately
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      // Make sure your register function is set up to handle FormData
      await register(formDataToSend);
      const response = await axios.post('http://localhost:3000/api/uploads', formDataToSend);
      if(response.status == 200){
        console.log("sdhajhdfdshfohdf")
      }
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  // Cleanup preview URL when component unmounts or when new file is selected
  React.useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="bg-indigo-600 rounded-t-xl px-6 py-4">
            <h2 className="text-2xl font-bold text-white text-center">Create Your Account</h2>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username field */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password & Role Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password field */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Role field */}
                <div className="space-y-1">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="student">Student</option>
                      <option value="professor">Professor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {/* Conditional Student Fields */}
              {formData.role === 'student' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Create Account
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;