// Required dependencies
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb+srv://sajalgarg2006:sajal123@cluster0.urmyxu4.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  });

/// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "admin", "professor"],
    required: true,
  },
  email: { type: String, required: true, unique: true },
});

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  enrollmentDate: { type: Date, default: Date.now },
  section: String,
  attendance: [
    {
      classId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSchedule" },
      present: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
    },
  ],
});

const classScheduleSchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  className: { type: String, required: true },
  section: { type: String, required: true },
  schedule: {
    day: String,
    startTime: String,
    endTime: String,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});


const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);
const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};

// Authentication Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      role,
    });

    await user.save();

    if (role === "student") {
      const student = new Student({
        userId: user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
      });
      await student.save();
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "24h",
    });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid login credentials");
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "24h",
    });
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Student Routes
app.get(
  "/api/student/dashboard",
  auth,
  authorize(["student"]),
  async (req, res) => {
    try {
      const student = await Student.findOne({ userId: req.user._id }).populate(
        "attendance.classId",
        "className section schedule"
      );
      const schedules = await ClassSchedule.find({
        students: student._id,
      }).populate("professorId", "username");
      res.json({ student, schedules });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

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

// Admin Routes
app.get("/api/admin/students", auth, async (req, res) => {
  try {
    const students = await Student.find().populate("userId", "username email");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/student/:id", auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/student/:id", auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(student.userId);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Professor Routes
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
