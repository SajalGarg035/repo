const express = require('express');
const mongoose = require('mongoose');
const { AttendanceSession, QRAttendance, ClassSchedule, Student } = require('../models');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const qrCodeGenerator = require('../utils/qrCodeGenerator');
const { validationResult, body } = require('express-validator');

const router = express.Router();

// Professor: Create QR attendance session
router.post('/session/create', 
  auth, 
  authorize(['professor']),
  [
    body('classScheduleId').isMongoId().withMessage('Valid class schedule ID required'),
    body('sessionName').trim().isLength({ min: 1 }).withMessage('Session name required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { classScheduleId, sessionName } = req.body;

      // Verify professor owns this class
      const classSchedule = await ClassSchedule.findOne({
        _id: classScheduleId,
        professorId: req.user._id
      });

      if (!classSchedule) {
        return res.status(404).json({
          error: 'Class not found or unauthorized'
        });
      }

      // Deactivate any existing active sessions for this class
      await AttendanceSession.updateMany(
        { 
          classScheduleId,
          isActive: true 
        },
        { isActive: false }
      );

      // Generate QR code data
      const sessionId = new mongoose.Types.ObjectId();
      const qrData = qrCodeGenerator.generateQRData(
        sessionId.toString(),
        req.user._id.toString(),
        classScheduleId
      );

      // Generate QR code image
      const qrCodeImage = await qrCodeGenerator.generateQRCode(qrData.qrData);

      // Create new session
      const session = new AttendanceSession({
        _id: sessionId,
        professorId: req.user._id,
        classScheduleId,
        sessionName,
        qrCode: qrData.qrData,
        qrCodeData: {
          sessionId: sessionId.toString(),
          timestamp: qrData.rawData.timestamp,
          encryptedData: qrData.qrData
        },
        expiresAt: qrData.expiresAt
      });

      await session.save();

      res.status(201).json({
        success: true,
        session: {
          id: session._id,
          sessionName: session.sessionName,
          qrCodeImage,
          expiresAt: session.expiresAt,
          className: classSchedule.className,
          section: classSchedule.section
        }
      });

    } catch (error) {
      console.error('Create QR session error:', error);
      next(error);
    }
  }
);

// Professor: Get active sessions
router.get('/sessions/active', 
  auth, 
  authorize(['professor']), 
  async (req, res, next) => {
    try {
      const sessions = await AttendanceSession.find({
        professorId: req.user._id,
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
      .populate('classScheduleId', 'className section')
      .sort({ createdAt: -1 });

      res.json({
        success: true,
        sessions: sessions.map(session => ({
          id: session._id,
          sessionName: session.sessionName,
          className: session.classScheduleId.className,
          section: session.classScheduleId.section,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          attendanceCount: session.attendanceRecords.length
        }))
      });

    } catch (error) {
      next(error);
    }
  }
);

// Professor: Get session details with attendance
router.get('/session/:sessionId', 
  auth, 
  authorize(['professor']), 
  async (req, res, next) => {
    try {
      const session = await AttendanceSession.findOne({
        _id: req.params.sessionId,
        professorId: req.user._id
      })
      .populate('classScheduleId', 'className section students')
      .populate('attendanceRecords.studentId', 'firstName lastName');

      if (!session) {
        return res.status(404).json({
          error: 'Session not found'
        });
      }

      // Get detailed attendance records
      const attendanceRecords = await QRAttendance.find({
        sessionId: session._id
      }).populate('studentId', 'firstName lastName section');

      res.json({
        success: true,
        session: {
          id: session._id,
          sessionName: session.sessionName,
          className: session.classScheduleId.className,
          section: session.classScheduleId.section,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          isActive: session.isActive,
          totalStudents: session.classScheduleId.students.length,
          presentStudents: attendanceRecords.length,
          attendanceRecords: attendanceRecords.map(record => ({
            student: {
              id: record.studentId._id,
              name: `${record.studentId.firstName} ${record.studentId.lastName}`,
              section: record.studentId.section
            },
            markedAt: record.markedAt,
            status: record.status
          }))
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Student: Mark attendance via QR code
router.post('/mark', 
  auth, 
  authorize(['student']),
  [
    body('qrData').notEmpty().withMessage('QR code data required'),
    body('location.latitude').optional().isFloat(),
    body('location.longitude').optional().isFloat()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { qrData, location } = req.body;

      // Validate QR code
      let qrCodeData;
      try {
        qrCodeData = qrCodeGenerator.validateQRData(qrData);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid or expired QR code'
        });
      }

      // Find the session
      const session = await AttendanceSession.findOne({
        _id: qrCodeData.sessionId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('classScheduleId');

      if (!session) {
        return res.status(404).json({
          error: 'Session not found or expired'
        });
      }

      // Find student record
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({
          error: 'Student profile not found'
        });
      }

      // Check if student is enrolled in this class
      const isEnrolled = session.classScheduleId.students.some(
        studentId => studentId.toString() === student._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          error: 'You are not enrolled in this class'
        });
      }

      // Check if already marked attendance
      const existingAttendance = await QRAttendance.findOne({
        sessionId: session._id,
        studentId: student._id
      });

      if (existingAttendance) {
        return res.status(409).json({
          error: 'Attendance already marked for this session'
        });
      }

      // Mark attendance
      const attendance = new QRAttendance({
        sessionId: session._id,
        studentId: student._id,
        classScheduleId: session.classScheduleId._id,
        location,
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
        }
      });

      await attendance.save();

      // Update session attendance records
      session.attendanceRecords.push({
        studentId: student._id,
        markedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await session.save();

      // Also update the traditional attendance system
      student.attendance.push({
        classId: session.classScheduleId._id,
        present: true,
        date: new Date()
      });

      await student.save();

      res.json({
        success: true,
        message: 'Attendance marked successfully',
        attendance: {
          sessionName: session.sessionName,
          className: session.classScheduleId.className,
          markedAt: attendance.markedAt
        }
      });

    } catch (error) {
      console.error('Mark attendance error:', error);
      next(error);
    }
  }
);

// Student: Get attendance history
router.get('/student/history', 
  auth, 
  authorize(['student']), 
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, classId } = req.query;

      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({
          error: 'Student profile not found'
        });
      }

      const query = { studentId: student._id };
      if (classId) {
        query.classScheduleId = classId;
      }

      const attendanceRecords = await QRAttendance.find(query)
        .populate('sessionId', 'sessionName createdAt')
        .populate('classScheduleId', 'className section')
        .sort({ markedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await QRAttendance.countDocuments(query);

      // Calculate attendance percentage
      const totalSessions = await AttendanceSession.countDocuments({
        classScheduleId: { $in: student.attendance.map(a => a.classId) }
      });

      const attendancePercentage = totalSessions > 0 
        ? Math.round((attendanceRecords.length / totalSessions) * 100) 
        : 0;

      res.json({
        success: true,
        attendance: {
          records: attendanceRecords.map(record => ({
            id: record._id,
            sessionName: record.sessionId.sessionName,
            className: record.classScheduleId.className,
            section: record.classScheduleId.section,
            markedAt: record.markedAt,
            status: record.status
          })),
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          },
          statistics: {
            totalPresent: attendanceRecords.length,
            totalSessions,
            attendancePercentage
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Professor: Get attendance report
router.get('/report/:classScheduleId', 
  auth, 
  authorize(['professor']), 
  async (req, res, next) => {
    try {
      const { classScheduleId } = req.params;
      const { startDate, endDate, format = 'json' } = req.query;

      // Verify professor owns this class
      const classSchedule = await ClassSchedule.findOne({
        _id: classScheduleId,
        professorId: req.user._id
      }).populate('students', 'firstName lastName section');

      if (!classSchedule) {
        return res.status(404).json({
          error: 'Class not found or unauthorized'
        });
      }

      // Build date filter
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      // Get all sessions for this class
      const sessions = await AttendanceSession.find({
        classScheduleId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }).sort({ createdAt: -1 });

      // Get attendance records
      const attendanceRecords = await QRAttendance.find({
        classScheduleId,
        ...(Object.keys(dateFilter).length > 0 && { markedAt: dateFilter })
      }).populate('studentId', 'firstName lastName section');

      // Generate report data
      const reportData = {
        classInfo: {
          className: classSchedule.className,
          section: classSchedule.section,
          totalStudents: classSchedule.students.length
        },
        summary: {
          totalSessions: sessions.length,
          totalAttendanceRecords: attendanceRecords.length,
          averageAttendance: sessions.length > 0 
            ? Math.round((attendanceRecords.length / (sessions.length * classSchedule.students.length)) * 100)
            : 0
        },
        sessions: sessions.map(session => ({
          id: session._id,
          sessionName: session.sessionName,
          date: session.createdAt,
          attendanceCount: attendanceRecords.filter(
            record => record.sessionId.toString() === session._id.toString()
          ).length
        })),
        studentAttendance: classSchedule.students.map(student => {
          const studentRecords = attendanceRecords.filter(
            record => record.studentId._id.toString() === student._id.toString()
          );
          return {
            student: {
              id: student._id,
              name: `${student.firstName} ${student.lastName}`,
              section: student.section
            },
            attendanceCount: studentRecords.length,
            attendancePercentage: sessions.length > 0 
              ? Math.round((studentRecords.length / sessions.length) * 100)
              : 0,
            records: studentRecords.map(record => ({
              sessionId: record.sessionId,
              markedAt: record.markedAt,
              status: record.status
            }))
          };
        })
      };

      if (format === 'csv') {
        // Generate CSV format
        const csv = generateCSVReport(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${classScheduleId}.csv`);
        return res.send(csv);
      }

      res.json({
        success: true,
        report: reportData
      });

    } catch (error) {
      next(error);
    }
  }
);

// Helper function to generate CSV report
function generateCSVReport(reportData) {
  const headers = ['Student Name', 'Section', 'Total Sessions', 'Present', 'Attendance %'];
  const rows = [headers.join(',')];

  reportData.studentAttendance.forEach(student => {
    const row = [
      `"${student.student.name}"`,
      student.student.section,
      reportData.summary.totalSessions,
      student.attendanceCount,
      `${student.attendancePercentage}%`
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

// Professor: End session manually
router.put('/session/:sessionId/end', 
  auth, 
  authorize(['professor']), 
  async (req, res, next) => {
    try {
      const session = await AttendanceSession.findOneAndUpdate(
        {
          _id: req.params.sessionId,
          professorId: req.user._id,
          isActive: true
        },
        { isActive: false },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({
          error: 'Session not found or already ended'
        });
      }

      res.json({
        success: true,
        message: 'Session ended successfully'
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;