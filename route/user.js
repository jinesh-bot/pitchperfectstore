const express= require('express')
const router= express.Router()
const User =require('../model/usermodel.js')
const bcrypt = require('bcrypt');
const auth = require('../middlewares/auth.js')

// Email and password validation patterns
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

router.get('/signup',auth.isLogin, (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup',auth.isLogin, async (req, res) => {
  try {
    // Trim all inputs when destructuring
    const { 
      name = '', 
      email = '', 
      password, 
      confirmPassword 
    } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ 
      name: trimmedName,
      email: trimmedEmail, 
      password: hashedPassword 
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ error: 'An error occurred during signup' });
  }
});

router.get('/login',auth.isLogin, (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  try {
    const { email = '', password } = req.body;
    const trimmedEmail = email.trim();
    
    const user = await User.findOne({ email: trimmedEmail });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.json({ success: true });
    } else {
      res.json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.json({ error: 'An error occurred during login' });
  }
});

router.get('/home', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('home', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports= router