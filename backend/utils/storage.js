const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const config = require('../config/config');

cloudinary.config(config.CLOUDINARY_CONFIG);

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user',
    allowed_formats: ['jpg', 'png', 'jpeg'], 
    public_id: (req, file) => `user-${Date.now()}`
  }
});

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/home/sajal/Music/SE-project-master (2)/known_faces/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const { firstName, lastName } = req.body;
    
    if (!firstName || !lastName) {
      cb(new Error('First name and last name are required'));
      return;
    }
    
    const filename = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${ext}`;
    cb(null, filename);
  }
});

// Create multer instances
const cloudUpload = multer({ storage: cloudStorage });
const diskUpload = multer({ storage: diskStorage });

module.exports = {
  cloudinary,
  cloudUpload,
  diskUpload
};
