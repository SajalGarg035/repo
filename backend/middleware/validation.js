const { body } = require('express-validator');

// Registration validation
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'admin', 'professor'])
];

// Student profile validation
const studentProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).escape(),
  body('lastName').optional().trim().isLength({ min: 2 }).escape(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('section').optional().trim().escape()
];

// Attendance validation
const attendanceValidation = [
  body('students.*.present').isBoolean(),
  body('students.*.studentId').isMongoId()
];

module.exports = {
  registerValidation,
  studentProfileValidation,
  attendanceValidation
};
