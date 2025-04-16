const express = require('express');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { Student, User, ClassSchedule } = require('../models');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { studentProfileValidation } = require('../middleware/validation');

const router = express.Router();

// Get all students
router.get("/students", auth, authorize(["admin"]), async (req, res, next) => {
  try {
    const students = await Student.find().populate("userId", "username email");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
});

// Update student profile by admin
router.put("/student/:id", 
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

// Delete student and associated data
router.delete("/student/:id", 
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

// Get all professors
router.get('/professors_list', async (req, res, next) => {
  try {
    const professors = await User.find({ role: 'professor' });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch professors' });
    next(error);
  }
});

module.exports = router;
