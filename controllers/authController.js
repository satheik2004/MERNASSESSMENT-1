const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
});

// Generate JWT Token
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

// 1. Login and Send OTP
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true });
    const otpExpires = new Date(Date.now() + 5 * 60000); // Valid for 5 minutes
    await User.updateOTP(email, otp, otpExpires);

    // Send OTP via Email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 2. Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user || user.otp !== otp || new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and send JWT
    await User.clearOTP(email);
    const token = generateToken(user);

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
