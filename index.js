// Replace import statements with require
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { body, validationResult } = require('express-validator');

// Configure environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sajalgarg2006:sajal123@cluster0.urmyxu4.mongodb.net/?retryWrites=true&w=majority";
const SALT_ROUNDS = 10;



const CLOUDINARY_CLOUD_NAME="dazaaaymw"
const CLOUDINARY_API_KEY="437619521957416"
const CLOUDINARY_API_SECRET="IJm6Pdn2_aH-xaqwNvXkuUHYbN8"
// const MONGO_URI=your_mongodb_uri
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
// MongoDB connection with proper error handling
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// Error handler for MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Models with improved validation
// MongoDB schema for storing image URLs and metadata
const imageSchema = new mongoose.Schema({
  imageUrl: String,
  description: String, // optional metadata
});
const Image = mongoose.model('Image', imageSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ["student", "admin", "professor"],
      message: '{VALUE} is not a valid role'
    },
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    max: [new Date(), 'Date of birth cannot be in the future']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  section: String,
  attendance: [{
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSchedule",
      required: true
    },
    present: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  photo: String
});

const classScheduleSchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true
  },
  schedule: {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    }
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }]
});

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);
const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Key Error',
      message: 'A record with that unique field already exists'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
};

// Authentication Middleware with better error handling
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new Error('No authentication token provided');
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};

// Input validation for registration
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'admin', 'professor'])
];

// Authentication Routes with validation
app.post("/api/register", registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password, email, role, photo } = req.body;
    console.log(photo);
    const result = await cloudinary.uploader.upload(photo);
    console.log(result);
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email or username is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      role,
      photo
    });

    await user.save();

    if (role === "student") {
      const { firstName, lastName, dateOfBirth } = req.body;
      if (!firstName || !lastName || !dateOfBirth) {
        throw new Error('Student details are required');
      }

      const student = new Student({
        userId: user._id,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth)
      });
      await student.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});
app.put(

  "/api/student/profile",

  auth,

  authorize(["student"]),

  async (req, res) => {

    try {

      const updates = req.body;

      const student = await Student.findOneAndUpdate(

        { userId: req.user._id },

        updates,

        { new: true }

      );

      res.json(student);

    } catch (error) {

      res.status(400).json({ error: error.message });

    }

  }

);


// Student Routes with error handling
app.get("/api/student/dashboard", auth, authorize(["student"]), async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('attendance.classId', 'className section schedule')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student profile not found'
      });
    }

    const schedules = await ClassSchedule.find({ students: student._id })
      .populate('professorId', 'username')
      .lean();

    res.json({
      student,
      schedules,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
});

/// Professor Routes
app.post("/api/professor/schedule", auth, async (req, res) => {
  try {
    const schedule = new ClassSchedule({
      professorId: req.user._id,
      ...req.body,
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put(
  "/api/professor/schedule/:id/students",
  auth,
  authorize(["professor"]),
  async (req, res) => {
    try {
      const schedule = await ClassSchedule.findByIdAndUpdate(
        req.params.id,
        { students: req.body.students },
        { new: true }
      );
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);
app.post(
  "/api/professor/schedule/:id/attendance",
  auth,
  authorize(["professor"]),
  async (req, res) => {
    try {
      const { classId, studentId, present } = req.body;
      const student = await Student.findById(studentId);
      student.attendance.push({
        classId,
        present,
        date: new Date(),
      });
      await student.save();
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

app.get(
  "/api/professor/schedules",
  auth,
  authorize(["professor"]),
  async (req, res) => {
    try {
      const schedules = await ClassSchedule.find({
        professorId: req.user._id,
      }).populate("students", "firstName lastName");
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Input validation middlewares
const studentProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).escape(),
  body('lastName').optional().trim().isLength({ min: 2 }).escape(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('section').optional().trim().escape()
];

const attendanceValidation = [
  body('students.*.present').isBoolean(),
  body('students.*.studentId').isMongoId()
];

// Student Routes
app.put("/api/student/profile", 
  auth, 
  authorize(["student"]), 
  studentProfileValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const allowedUpdates = ['firstName', 'lastName', 'dateOfBirth', 'section', 'photo'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const student = await Student.findOneAndUpdate(
        { userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Student profile not found'
        });
      }

      res.json({
        message: 'Profile updated successfully',
        student
      });
    } catch (error) {
      next(error);
    }
});

// Admin Routes
// Admin Routes
app.get("/api/admin/students", auth, async (req, res) => {
  try {
    const students = await Student.find().populate("userId", "username email");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/student/:id", 
  auth, 
  authorize(["admin"]), 
  studentProfileValidation,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid student ID format'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Student not found'
        });
      }

      res.json({
        message: 'Student updated successfully',
        student
      });
    } catch (error) {
      next(error);
    }
});

app.delete("/api/admin/student/:id", 
  auth, 
  authorize(["admin"]), 
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid student ID format'
        });
      }

      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Student not found'
        });
      }

      // Start a session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Delete student and associated user
        await Student.findByIdAndDelete(student._id).session(session);
        await User.findByIdAndDelete(student.userId).session(session);

        // Remove student from all class schedules
        await ClassSchedule.updateMany(
          { students: student._id },
          { $pull: { students: student._id } }
        ).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json({
          message: 'Student and associated data deleted successfully'
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      next(error);
    }
});

// Professor Routes
app.get("/api/professor/schedules", 
  auth, 
  authorize(["professor"]), 
  async (req, res, next) => {
    try {
      const { day, section } = req.query;
      const query = { professorId: req.user._id };

      if (day) query['schedule.day'] = day;
      if (section) query.section = section;

      const schedules = await ClassSchedule.find(query)
        .populate('students', 'firstName lastName')
        .lean();

      res.json({
        message: 'Schedules retrieved successfully',
        schedules
      });
    } catch (error) {
      next(error);
    }
});

app.put("/api/professor/schedule/:id/students", 
  auth, 
  authorize(["professor"]), 
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid schedule ID format'
        });
      }

      const { students } = req.body;
      if (!Array.isArray(students)) {
        return res.status(400).json({
          error: 'Invalid Input',
          message: 'Students must be an array of IDs'
        });
      }

      // Validate all student IDs
      const validStudents = students.every(id => mongoose.Types.ObjectId.isValid(id));
      if (!validStudents) {
        return res.status(400).json({
          error: 'Invalid Input',
          message: 'One or more student IDs are invalid'
        });
      }

      const schedule = await ClassSchedule.findOneAndUpdate(
        {
          _id: req.params.id,
          professorId: req.user._id
        },
        { students },
        { new: true, runValidators: true }
      ).populate('students', 'firstName lastName');

      if (!schedule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Schedule not found or unauthorized'
        });
      }

      res.json({
        message: 'Students updated successfully',
        schedule
      });
    } catch (error) {
      next(error);
    }
});

app.post("/api/professor/schedule/:id/attendance",
  auth,
  authorize(["professor"]),
  attendanceValidation,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid schedule ID format'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const schedule = await ClassSchedule.findOne({
        _id: req.params.id,
        professorId: req.user._id
      });

      if (!schedule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Schedule not found or unauthorized'
        });
      }

      const { students } = req.body;
      const attendanceDate = new Date();

      // Start a session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatePromises = students.map(async ({ studentId, present }) => {
          const student = await Student.findById(studentId).session(session);
          if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
          }

          // Add attendance record
          student.attendance.push({
            classId: schedule._id,
            present,
            date: attendanceDate
          });

          return student.save();
        });

        await Promise.all(updatePromises);
        await session.commitTransaction();
        session.endSession();

        res.json({
          message: 'Attendance recorded successfully',
          date: attendanceDate
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      next(error);
    }
});

// Get attendance statistics
app.get("/api/professor/schedule/:id/attendance-stats",
  auth,
  authorize(["professor"]),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid schedule ID format'
        });
      }

      const schedule = await ClassSchedule.findOne({
        _id: req.params.id,
        professorId: req.user._id
      });

      if (!schedule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Schedule not found or unauthorized'
        });
      }

      const stats = await Student.aggregate([
        {
          $match: {
            'attendance.classId': schedule._id
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            totalClasses: {
              $size: {
                $filter: {
                  input: '$attendance',
                  as: 'attend',
                  cond: { $eq: ['$$attend.classId', schedule._id] }
                }
              }
            },
            presentClasses: {
              $size: {
                $filter: {
                  input: '$attendance',
                  as: 'attend',
                  cond: {
                    $and: [
                      { $eq: ['$$attend.classId', schedule._id] },
                      { $eq: ['$$attend.present', true] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $addFields: {
            attendancePercentage: {
              $multiply: [
                { $divide: ['$presentClasses', '$totalClasses'] },
                100
              ]
            }
          }
        }
      ]);

      res.json({
        message: 'Attendance statistics retrieved successfully',
        stats
      });
    } catch (error) {
      next(error);
    }
});

// Download attendance report
app.get("/api/professor/schedule/:id/attendance-report",
  auth,
  authorize(["professor"]),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid ID',
          message: 'Invalid schedule ID format'
        });
      }

      const schedule = await ClassSchedule.findOne({
        _id: req.params.id,
        professorId: req.user._id
      }).populate('students', 'firstName lastName');

      if (!schedule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Schedule not found or unauthorized'
        });
      }

      // Generate CSV data
      const csvRows = ['Student Name,Date,Status'];
      
      for (const student of schedule.students) {
        const attendance = await Student.findById(student._id)
          .select('attendance')
          .lean();

        const studentAttendance = attendance.attendance
          .filter(a => a.classId.toString() === schedule._id.toString())
          .map(a => `${student.firstName} ${student.lastName},${new Date(a.date).toLocaleDateString()},${a.present ? 'Present' : 'Absent'}`);

        csvRows.push(...studentAttendance);
      }

      const csvContent = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${schedule._id}.csv`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
});

// ... (Rest of the server code remains the same)
// Apply error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Closing server...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start server with error handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});