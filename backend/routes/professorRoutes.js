const express = require('express');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { ClassSchedule, Student } = require('../models');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { attendanceValidation } = require('../middleware/validation');

const router = express.Router();

// Create a class schedule
router.post("/schedule", auth, authorize(["professor"]), async (req, res, next) => {
  try {
    const schedule = new ClassSchedule({
      professorId: req.user._id,
      ...req.body
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error);
  }
});

// Get all schedules for a professor
router.get("/schedules", auth, authorize(["professor"]), async (req, res, next) => {
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

// Update students in a schedule
router.put("/schedule/:id/students", auth, authorize(["professor"]), async (req, res, next) => {
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

// Record attendance
router.post("/schedule/:id/attendance", auth, authorize(["professor"]), attendanceValidation, async (req, res, next) => {
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
router.get("/schedule/:id/attendance-stats", auth, authorize(["professor"]), async (req, res, next) => {
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
router.get("/schedule/:id/attendance-report", auth, authorize(["professor"]), async (req, res, next) => {
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
// Add this route with the other professor routes (around line 450-500)
router.get(
  "/students",
  auth,
  authorize(["professor"]),
  async (req, res, next) => {
    try {
      const students = await Student.find()
        .populate("userId", "username email")
        .lean();

      res.json({
        message: 'Students retrieved successfully',
        students
      });
    } catch (error) {
      console.error("Failed to fetch students for professor:", error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch students'
      });
    }
  }
);

module.exports = router;
