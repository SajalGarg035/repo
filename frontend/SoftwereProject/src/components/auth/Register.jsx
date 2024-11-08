import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'student',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    photo:'',
  });
  // const [photo, setPhoto] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="App">
      <style>
        {`
        .App {
          text-align: center;
          background-image: url("https://codetheweb.blog/assets/img/posts/css-advanced-background-images/cover.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 100vh;
        }

        .card {
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
          margin-top: 50px;
          background-color: rgba(248, 249, 250, 0.7);
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          background-color: #007bff;
          color: white;
        }

        .card-body {
          padding: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          font-weight: bold;
          color: #333;
        }

        .form-control {
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ced4da;
          border-radius: 5px;
        }

        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .btn-primary {
          width: 100%;
          font-size: 18px;
          font-weight: bold;
          background-color: #007bff;
          border: none;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }
        `}
      </style>

      <div className="card shadow-lg">
        <div className="card-header">
          <h4 className="mb-0">Register</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="file"
                value={formData.photo}
                onChange={(e) =>
                  setFormData({ ...formData, photo: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              
              <label htmlFor="role" className="form-label">Role</label>
              <select
                id="role"
                className="form-control"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === 'student' && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
