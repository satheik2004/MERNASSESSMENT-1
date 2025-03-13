const db = require('../config/db');

// Find user by email
exports.findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Update OTP and Expiration
exports.updateOTP = async (email, otp, otpExpires) => {
  await db.query('UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?', [otp, otpExpires, email]);
};

// Clear OTP after verification
exports.clearOTP = async (email) => {
  await db.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?', [email]);
};
