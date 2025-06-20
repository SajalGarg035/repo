const mongoose = require('mongoose');

const qrAttendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttendanceSession",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  classScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSchedule",
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'present'
  }
});

// Compound index to prevent duplicate attendance
qrAttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
qrAttendanceSchema.index({ classScheduleId: 1, markedAt: -1 });

const QRAttendance = mongoose.model('QRAttendance', qrAttendanceSchema);

module.exports = QRAttendance;