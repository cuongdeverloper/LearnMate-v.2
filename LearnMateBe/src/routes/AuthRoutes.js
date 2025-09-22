const express = require('express');
const { apiLogin, apiRegister, verifyOtp, requestPasswordReset, resetPassword, verifyAccountByLink } = require('../controller/Auth/AuthController');
const RouteAuth = express.Router();

RouteAuth.post('/login', apiLogin);
RouteAuth.post('/register', apiRegister);
//reset password
RouteAuth.post('/rqreset-password', requestPasswordReset);
RouteAuth.post('/reset-password', resetPassword);
//OTP
RouteAuth.post('/verify-otp', verifyOtp);
RouteAuth.get('/verify-account', verifyAccountByLink);
module.exports = { RouteAuth };