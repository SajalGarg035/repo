require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  QR_SECRET_KEY: process.env.QR_SECRET_KEY || "your_qr_secret_key_change_in_production",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://sajalgarg2006:sajal123@cluster0.urmyxu4.mongodb.net/?retryWrites=true&w=majority",
  SALT_ROUNDS: 10,
  NODE_CODE_SENDING_EMAIL_ADD: process.env.NODE_CODE_SENDING_EMAIL_ADD || "maatakamakhya2005@gmail.com",
  NODE_CODE_SENDING_EMAIL_PASS: process.env.NODE_CODE_SENDING_EMAIL_PASS || "ulvdxnotptaazssf",
  CLOUDINARY_CONFIG: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dazaaaymw",
    api_key: process.env.CLOUDINARY_API_KEY || "437619521957416",
    api_secret: process.env.CLOUDINARY_API_SECRET || "IJm6Pdn2_aH-xaqwNvXkuUHYbN8"
  },
  BASE_URL: process.env.BASE_URL || "http://localhost:5000"
};