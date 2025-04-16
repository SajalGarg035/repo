const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Student } = require('../models');
const { cloudUpload } = require('../utils/storage');
const { registerValidation } = require('../middleware/validation');
const { sendForgotPasswordEmail } = require('../utils/email');
const config = require('../config/config');

const router = express.Router();

// Register new user
router.post("/register", cloudUpload.single('photo'), registerValidation, async (req, res) => {
  try {
    console.log(1);
    const errors = validationResult(req);
    console.log(1);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    console.log(1);
    
    const { username, password, email, role } = req.body;
    const photo = req.file ? req.file.path : 'default_photo_url';
    console.log(1);

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    console.log(1);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'Email or username is already registered'
      });
    }
    console.log(1);

    const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS);
    console.log(1);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      role,
      photo
    });
    console.log(1);
    await user.save();
    console.log(1);
    // Handle student role data
    if (role === "student") {
      const { firstName, lastName, dateOfBirth } = req.body;
      if (!firstName || !lastName || !dateOfBirth) {
        await User.findByIdAndDelete(user._id); // Rollback user creation
        return res.status(400).json({
          success: false,
          error: 'Missing student data',
          message: 'Student details (firstName, lastName, dateOfBirth) are required'
        });
      }
      console.log(1);
      try {
        const student = new Student({
          userId: user._id,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          photo
        });
        await student.save();
      } catch (studentError) {
        await User.findByIdAndDelete(user._id); // Rollback user creation
        return res.status(500).json({
          success: false,
          error: 'Student registration failed',
          message: studentError.message
        });
      }
    }
    console.log(1);
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "24h" });
    console.log(1);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "24h" });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send forgot password code
router.post('/sendfpcode', async(req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false, 
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false, 
        message: "No user with this email found"
      });
    }

    // Generate a 6-digit code
    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const info = await sendForgotPasswordEmail(user.email, codeValue);
      
      if (!info.accepted || !info.accepted.includes(user.email)) {
        return res.status(500).json({
          success: false, 
          message: "Failed to send email. Please try again later."
        });
      }
      
      // Save the code and its expiry time to user document
      user.forgotPasswordCode = codeValue;
      user.forgotPasswordCodeValidation = Date.now();
      await user.save();

      return res.status(200).json({
        success: true, 
        message: "Password reset code sent successfully to your email"
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false, 
        message: "Failed to send password reset email"
      });
    }
  } catch (err) {
    console.error('Password reset request error:', err);
    return res.status(500).json({
      success: false, 
      message: "Server error", 
      error: err.message
    });
  }
});

// Verify forgot password code and update password
router.post('/verifyfpcode', async(req, res) => {
  try {
    const { email, providedCode, newpassword } = req.body;
    
    // Input validation
    if (!email || !providedCode || !newpassword) {
      return res.status(400).json({
        success: false, 
        message: "Email, verification code, and new password are required"
      });
    }

    if (newpassword.length < 6) {
      return res.status(400).json({
        success: false, 
        message: "Password must be at least 6 characters long"
      });
    }

    const codeValue = providedCode.toString();
    const user = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation");

    if (!user) {
      return res.status(404).json({
        success: false, 
        message: "No user with this email found"
      });
    }

    if (!user.forgotPasswordCode) {
      return res.status(400).json({
        success: false, 
        message: "No reset code was requested or code was already used"
      });
    }

    // Validate code
    if (codeValue !== user.forgotPasswordCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid verification code" 
      });
    }

    // Check if code has expired (5 minutes)
    if (Date.now() - user.forgotPasswordCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false, 
        message: "Verification code has expired. Please request a new one"
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newpassword, config.SALT_ROUNDS);
    user.password = hashedPassword;
    user.forgotPasswordCode = undefined;
    user.forgotPasswordCodeValidation = undefined;

    await user.save();
    
    return res.status(200).json({
      success: true, 
      message: "Your password has been updated successfully"
    });
    
  } catch (err) {
    console.error('Password reset verification error:', err);
    return res.status(500).json({
      success: false, 
      message: "Server error", 
      error: err.message
    });
  }
});

module.exports = router;
