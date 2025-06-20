const crypto = require('crypto');
const QRCode = require('qrcode');

class QRCodeGenerator {
  constructor() {
    this.secretKey = process.env.QR_SECRET_KEY || 'your-secret-key-change-in-production';
  }

  // Generate encrypted QR code data
  generateQRData(sessionId, professorId, classScheduleId) {
    const timestamp = Date.now();
    const expiresAt = timestamp + (5 * 60 * 1000); // 5 minutes from now
    
    const data = {
      sessionId,
      professorId,
      classScheduleId,
      timestamp,
      expiresAt
    };

    const encryptedData = this.encrypt(JSON.stringify(data));
    
    return {
      qrData: encryptedData,
      expiresAt: new Date(expiresAt),
      rawData: data
    };
  }

  // Generate QR code image
  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  // Decrypt and validate QR code data
  validateQRData(encryptedData) {
    try {
      const decryptedData = this.decrypt(encryptedData);
      const data = JSON.parse(decryptedData);
      
      // Check if QR code has expired
      if (Date.now() > data.expiresAt) {
        throw new Error('QR code has expired');
      }

      return data;
    } catch (error) {
      throw new Error('Invalid or expired QR code');
    }
  }

  // Encrypt data
  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt data
  decrypt(encryptedData) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = new QRCodeGenerator();