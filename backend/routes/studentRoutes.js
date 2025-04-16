const express = require('express');
const { validationResult } = require('express-validator');
const { Student, ClassSchedule } = require('../models');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { studentProfileValidation } = require('../middleware/validation');

const router = express.Router();

// Get student dashboard
router.get("/dashboard", auth, authorize(["student"]), async (req, res, next) => {
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

// Update student profile
router.put("/profile", 
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

module.exports = router;
