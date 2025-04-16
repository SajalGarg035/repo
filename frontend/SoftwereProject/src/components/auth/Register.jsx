import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
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
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { register } = useAuth(); // Remove 'uploads' from here if it's not used elsewhere
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Append all form data fields
      // Object.keys(formData).forEach((key) => {
      //   // Only append student-specific fields if the role is student
      //   if (['firstName', 'lastName', 'dateOfBirth'].includes(key) && formData.role !== 'student') {
      //     return; // Skip non-student fields if role is not student
      //   }
      //   userData.append(key, formData[key]);
      // });


      console.log(formData);

      var userData=formData;
      
      
      // Append photo if selected
      if (photo) {
        userData={
          ...userData,
          photo: photo,
        }
      }

      console.log(userData);
      

      // Single call to register endpoint
      await register(userData); 
      
      // Removed the conditional uploads call:
      // if(formData.role === 'student'){
      //   await uploads(formDataToSend); 
      // }

      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      // Log the detailed error for debugging
      console.error("Registration Error:", error); 
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.hindustantimes.com/img/2022/05/27/1600x900/139aec36-ddd1-11ec-8839-d8f781242971_1653675995787.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 border border-gray-200/30">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-gray-600 text-sm">
            Register and start your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Username and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white text-gray-900 shadow-sm transition-all"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload className="h-7 w-7 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4 file:rounded-full 
                  file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 
                  hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Student-specific Fields */}
          {formData.role === 'student' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      bg-white text-gray-900 shadow-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      bg-white text-gray-900 shadow-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      bg-white text-gray-900 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent 
              rounded-lg shadow-md text-sm font-semibold text-white 
              bg-blue-600 hover:bg-blue-700 focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;