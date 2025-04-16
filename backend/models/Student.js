const mongoose = require('mongoose');

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
    type: String,
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
  }]
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
