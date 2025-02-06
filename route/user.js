const express= require('express')
const router= express.Router()

const User =require('../model/usermodel.js')
const bcrypt = require('bcrypt');
const auth = require('../middlewares/auth.js')

//otp
const {generateOTP,sendOTP}=require('../utils/OTP.js')

const passport = require('passport');
require('../utils/googleAuth');

// Email and password validation patterns
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

router.get('/signup',auth.isLogin, (req, res) => {
  res.render('user/signup', { error: null });
});

router.post('/signup', auth.isLogin, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    
    // Validate name
    if (!trimmedName || trimmedName.length < 2) {
      return res.json({ error: 'Name must be at least 2 characters long' });
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.json({ error: 'Passwords do not match' });
    }
    
    // Validate email format
    if (!emailRegex.test(trimmedEmail)) {
      return res.json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return res.json({ error: 'Password syntax error' });
    }

    // Check if email already exists (use trimmed email)
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.json({ error: 'Email already registered' });
    }

    // Generate OTP before creating user
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Create user with OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      name: trimmedName,
      email: trimmedEmail, 
      password: hashedPassword,
      otp: {
        code: otp,
        expiresAt
      }
    });

    // Store user ID in session
    req.session.tempUser = {
      userId: newUser._id,
      email: trimmedEmail
    };
    
    // Send OTP
    await sendOTP(trimmedEmail, otp);

    res.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    res.json({ error: 'An error occurred during signup' });
  }
});

router.get('/login',auth.isLogin, (req, res) => res.render('user/login'));
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.json({ error: 'Invalid email or password' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.json({ error: 'Your account has been blocked. Please contact support.' });
    }

    // If user is a Google user
    if (user.googleId) {
      return res.json({ error: 'Please use Google Sign In for this account' });
    }

    // Regular password check
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.user = user;
      res.json({ success: true });
    } else {
      res.json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.json({ error: 'An error occurred during login' });
  }
});

router.get('/home', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('user/home', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.session.tempUser?.userId;

        if (!userId) {
            return res.json({ error: 'Session expired. Please try signing up again.' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ error: 'User not found. Please try signing up again.' });
        }

        if (!user.otp.code || !user.otp.expiresAt) {
            return res.json({ error: 'No OTP found. Please request a new one.' });
        }

        if (user.otp.expiresAt < new Date()) {
            return res.json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.json({ error: 'Invalid OTP. Please try again.' });
        }

        // Update user verification status
        user.isVerified = true;
        user.otp = { code: null, expiresAt: null };
        await user.save();

        // Clear session
        delete req.session.tempUser;

        res.json({ success: true });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.json({ error: 'Error verifying OTP. Please try again.' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const userId = req.session.tempUser?.userId;
        
        if (!userId) {
            return res.json({ error: 'Session expired. Please try signing up again.' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ error: 'User not found. Please try signing up again.' });
        }

        // Generate new OTP
        const newOTP = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Update user's OTP
        user.otp = {
            code: newOTP,
            expiresAt
        };
        await user.save();

        // Send new OTP
        await sendOTP(user.email, newOTP);

        res.json({ success: true });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.json({ error: 'Error resending OTP. Please try again.' });
    }
});

// Google Auth Routes
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' 
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        // Successful authentication
        req.session.user = req.user;
        res.redirect('/home');
    }
);

// GET route to render forgot password page
router.get('/forgot-password', (req, res) => {
    try {
        res.render('user/forgot-password');
    } catch (error) {
        console.error('Error loading forgot password page:', error);
        res.status(500).send('Error loading forgot password page');
    }
});

// POST route to handle forgot password request
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            return res.json({ error: 'No account found with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Save OTP to user
        user.otp = {
            code: otp,
            expiresAt
        };
        await user.save();

        // Send OTP email
        await sendOTP(email, otp);

        res.json({ 
            success: true, 
            message: 'Password reset OTP has been sent to your email' 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.json({ error: 'Error sending reset OTP. Please try again.' });
    }
});

// Verify OTP for forgot password
router.post('/verify-forgot-password-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.trim() });
        
        if (!user) {
            return res.json({ error: 'User not found. Please try again.' });
        }

        if (!user.otp.code || !user.otp.expiresAt) {
            return res.json({ error: 'No OTP found. Please request a new one.' });
        }

        if (user.otp.expiresAt < new Date()) {
            return res.json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.json({ error: 'Invalid OTP. Please try again.' });
        }

        // Store email in session for password reset
        req.session.resetEmail = email;

        // Clear OTP after successful verification
        user.otp = { code: null, expiresAt: null };
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.json({ error: 'Error verifying OTP. Please try again.' });
    }
});

// Resend OTP for forgot password
router.post('/resend-forgot-password-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.trim() });
        
        if (!user) {
            return res.json({ error: 'User not found. Please try again.' });
        }

        // Generate new OTP
        const newOTP = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Update user's OTP
        user.otp = {
            code: newOTP,
            expiresAt
        };
        await user.save();

        // Send new OTP
        await sendOTP(email, newOTP);

        res.json({ success: true });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.json({ error: 'Error resending OTP. Please try again.' });
    }
});

// Add this route to handle password reset
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email: email.trim() });
        
        if (!user) {
            return res.json({ error: 'User not found' });
        }

        // Validate password format using the existing regex
        if (!passwordRegex.test(password)) {
            return res.json({ 
                error: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters' 
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user's password
        user.password = hashedPassword;
        
        // Clear any existing OTP
        user.otp = { code: null, expiresAt: null };
        
        // Save the changes
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password updated successfully' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.json({ 
            error: 'An error occurred while resetting your password. Please try again.' 
        });
    }
});

module.exports= router