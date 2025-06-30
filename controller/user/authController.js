const User = require('../../model/usermodel');
const bcrypt = require('bcrypt');
const { generateOTP, sendOTP } = require('../../utils/OTP');
const passport = require('passport');

exports.getSignup = (req, res) => {
  res.render('user/signup', { error: null });
};

exports.postSignup = async (req, res) => {
  // ... your signup logic ...
};

exports.getLogin = (req, res) => {
  res.render('user/login');
};

exports.postLogin = async (req, res) => {
  // ... your login logic ...
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

// ...and so on for OTP, password reset, etc.

// Google Auth: Start
exports.googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' 
});

// Google Auth: Callback
exports.googleAuthCallback = [
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/home');
  }
];
