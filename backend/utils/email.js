const nodemailer = require('nodemailer');
const config = require('../config/config');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.NODE_CODE_SENDING_EMAIL_ADD,
    pass: config.NODE_CODE_SENDING_EMAIL_PASS,
  }
});

const sendForgotPasswordEmail = async (email, code) => {
  const info = await transport.sendMail({
    from: config.NODE_CODE_SENDING_EMAIL_ADD,
    to: email,
    subject: "Forgot Password CODE",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #4A90E2; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Forgot Password Request</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">You requested to reset your password. Use the code below to proceed:</p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="display: inline-block; background-color: #F7F9FC; border: 1px solid #4A90E2; border-radius: 4px; padding: 10px 20px; font-size: 24px; color: #4A90E2; letter-spacing: 2px;">
              ${code}
            </p>
          </div>
          <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email or contact support.</p>
        </div>
        <div style="background-color: #F1F1F1; padding: 10px; text-align: center; font-size: 12px; color: #888;">
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    `
  });

  return info;
};

module.exports = {
  transport,
  sendForgotPasswordEmail
};
