const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  classScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSchedule",
    required: true
  },
  sessionName: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  qrCodeData: {
    sessionId: String,
    timestamp: Date,
    encryptedData: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attendanceRecords: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }]
});

// Index for efficient queries
attendanceSessionSchema.index({ professorId: 1, createdAt: -1 });
attendanceSessionSchema.index({ qrCode: 1 });
attendanceSessionSchema.index({ expiresAt: 1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;