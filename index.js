const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const app = express();
const path = require('path');  // Import the path module
const fs = require('fs').promises;









const NODE_CODE_SENDING_EMAIL_ADD="maatakamakhya2005@gmail.com"
const NODE_CODE_SENDING_EMAIL_PASS="ulvdxnotptaazssf"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const MONGODB_URI = process.env.MONGODB_URI ||"mongodb+srv://sajalgarg2006:sajal123@cluster0.urmyxu4.mongodb.net/?retryWrites=true&w=majority";
const SALT_ROUNDS = 10;
const CLOUDINARY_CLOUD_NAME="dazaaaymw"
const CLOUDINARY_API_KEY="437619521957416"
const CLOUDINARY_API_SECRET="IJm6Pdn2_aH-xaqwNvXkuUHYbN8"
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user',
    allowed_formats: ['jpg', 'png', 'jpeg'], 
    public_id: (req, file) => `user-${Date.now()}`
  }
});

const upload = multer({ storage });
// const MONGO_URI=your_mongodb_uri
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

















// Middleware
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
}));
app.use(express.json());


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

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
const imageSchema = new mongoose.Schema({
  imageUrl: String,
  description: String,
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
  photo: {
    type:String,
    default: 'default_photo_url' ,
  },
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
  photo: {
    type : String, 
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

app.post("/api/register", upload.single('photo'), registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.file);
    
    const { username, password, email, role } = req.body;
    const photo = req.file.path;

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
        dateOfBirth: new Date(dateOfBirth),
        photo,
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
    console.error(error); // Helpful during development
    res.status(500).json({ error: 'Internal server error', details: error.message });
    next(error); // Call next for centralized error handling, if any
  }
});


// Modify the diskStorage configuration to handle custom naming
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/home/sajal/Music/SE-project-master (2)/known_faces/');
  },
  filename: (req, file, cb) => {
    // Get file extension
    const ext = path.extname(file.originalname);
    
    // Get firstName and lastName from request body
    const { firstName, lastName } = req.body;
    
    if (!firstName || !lastName) {
      cb(new Error('First name and last name are required'));
      return;
    }
    
    // Create filename with firstName_lastName format
    const filename = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${ext}`;
    cb(null, filename);
  }
});

const diskUpload = multer({ storage: diskStorage });

// Modified upload route
app.post('/api/uploads', diskUpload.single('photo'), async (req, res, next) => {
  const {role} = req.body;
  if(role !='student'){
    return res.status(200).json({ error: 'continue' });
  }
  try {
    const { firstName, lastName } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'First name and last name are required' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please provide a photo'
      });
    }

    const file = req.file;
    const { filename, path: filePath, size } = file;
    
    // Create file URL
    const fileUrl = `${process.env.BASE_URL}/uploads/${filename}`;
    
    // Return success response
    res.json({ 
      success: true,
      data: {
        filename,
        fileUrl,
        size,
        firstName,
        lastName
      }
    });

  } catch (error) {
    // If there's an error and a file was uploaded, clean it up
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    console.error(error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
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


// In your server-side routes file (e.g., routes/admin.js)
app.get('/api/professors_list', async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch professors' });
  }
});


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
app.get('/mark_attendance', async function(req, res) {
  try {
    const response = await axios.get('http://127.0.0.1:8000/get_attendance_json');
    
    const data = response.data.final_attendance;
    console.log(data);
    // Iterate through each attendance record
    for (let record of data) {
      const student = await Student.findOne({ name: record.name }); // Find student by name
      if (!student) {
        continue; // Skip if the student is not found
      }

      // Check if the student has attendance record for the current date
      const attendance = student.attendance.find(a => a.firstName.toString() === record.name.toString());

      if (!attendance) {
        // If no attendance record exists, add it
        student.attendance.push({
          present: true  // Assuming presence is based on this attendance record
        });

        // Save the student document
        await student.save();
      }
    }




    // Send success response after processing all records
    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});






// Route to mark attendance for a student

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

const transport = nodemailer.createTransport({
  service:'gmail',
  auth:{
      user: process.env.NODE_CODE_SENDING_EMAIL_ADD || NODE_CODE_SENDING_EMAIL_ADD,
      pass: process.env.NODE_CODE_SENDING_EMAIL_PASS || NODE_CODE_SENDING_EMAIL_PASS,
   }
});
var forgotPasswordCodeValidation = 0;
var forgotPasswordCode = 0;
app.post('/api/sendfpcode', async(req, res) => {
  const {email} = req.body;
 
  // console.log(process.env.NODE_CODE_SENDING_EMAIL_PASS);

  try{
      const user = await User.findOne({email:email});
      if(!user){
          return res.status(404).json({success: false, message: "No user with this email found!"})
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();
      let info = await transport.sendMail({
        from: NODE_CODE_SENDING_EMAIL_ADD,
        to: user.email,
        subject: "Forgot Password CODE",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #4A90E2; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Forgot Password Request</h1>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; color: #333;">Hello,</p>
              <p style="font-size: 16px; color: #333;">You requested to reset your password. Use the code below to proceed:</p>
              <div style="text-align: center; margin: 20px 0;">
                <p style="display: inline-block; background-color: #F7F9FC; border: 1px solid #4A90E2; border-radius: 4px; padding: 10px 20px; font-size: 24px; color: #4A90E2; letter-spacing: 2px;">
                  ${codeValue}
                </p>
              </div>
              <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email or contact support.</p>
            </div>
            <div style="background-color: #F1F1F1; padding: 10px; text-align: center; font-size: 12px; color: #888;">
              <p>© 2024 Your Company. All rights reserved.</p>
            </div>
          </div>
        `
      });
      

      // console.log('Email sent:', info);

      if(info.accepted[0] === user.email){
          user.forgotPasswordCode = codeValue;
          forgotPasswordCode = codeValue;
          forgotPasswordCodeValidation = Date.now();
          user.forgotPasswordCodeValidation = Date.now();
          await user.save();

          return res.status(200).json({success:true, message:"Forgot password code sent successfully"});
      }
      return res.status(400).json({success:false, message:"Password cannot be updated"});
  }
  catch(err){
      console.log("Error while reseting password ", err);
  }
})

app.post('/api/verifyfpcode', async(req, res) => {
  const {email, providedCode, newpassword} = req.body;
  try{
      const codeValue = providedCode.toString();
      const user = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation");

      if(!user){
          return res.status(404).json({success: false, message: "No user with this email found!"})
      }
      console.log(codeValue);
      console.log(user.forgotPasswordCode);
      console.log(user.forgotPasswordCodeValidation);
      if (codeValue !== user.forgotPasswordCode) {
        return res.status(400).json({ success: false, message: "Invalid code provided" });
    }
    

      if(Date.now() - user.forgotPasswordCodeValidation > 5 * 60 * 1000){
          return res.status(400).json({success:false, message:"Code has been expired"});
      }

      if(codeValue === user.forgotPasswordCode){
          const hashedPassword = await hash(newpassword, 12);
          user.password = hashedPassword;
          user.forgotPasswordCode = undefined;
          user.forgotPasswordCodeValidation = undefined;

          await user.save();
          return res.status(200).json({success:true, message:"You password has been updated successfully!!", user});
      }
      else{
          return res.status(400).json({success:false, message:"Unexpected error occured!!"});
      }
  }
  catch(err){
      console.log("Error while trying to reset password ", err);
  }
})



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

