const express = require('express');
const axios = require('axios');
const { Student } = require('../models');

const router = express.Router();

// Mark attendance from face recognition API
router.get('/mark_attendance', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/get_attendance_json');
    
    const data = response.data.final_attendance;
    console.log(data);
    
    // Iterate through each attendance record
    for (let record of data) {
      const student = await Student.findOne({ firstName: record.name }); // Find student by name
      if (!student) {
        continue; // Skip if the student is not found
      }

      // Check if the student has attendance record for the current date
      const attendance = student.attendance.find(a => a.firstName && a.firstName.toString() === record.name.toString());

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

module.exports = router;
