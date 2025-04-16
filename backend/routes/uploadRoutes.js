const express = require('express');
const fs = require('fs').promises;
const { diskUpload } = require('../utils/storage');
const config = require('../config/config');

const router = express.Router();

// Upload student photo
router.post('/uploads', diskUpload.single('photo'), async (req, res, next) => {
  const { role } = req.body;
  if (role !== 'student') {
    return res.status(200).json({ error: 'continue' });
  }
  
  try {
    const { firstName, lastName } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'First name and last name are required' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please provide a photo'
      });
    }

    const file = req.file;
    const { filename, path: filePath, size } = file;
    
    // Create file URL
    const fileUrl = `${config.BASE_URL}/uploads/${filename}`;
    
    // Return success response
    res.json({ 
      success: true,
      data: {
        filename,
        fileUrl,
        size,
        firstName,
        lastName
      }
    });

  } catch (error) {
    // If there's an error and a file was uploaded, clean it up
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    console.error(error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
    next(error);
  }
});

module.exports = router;
