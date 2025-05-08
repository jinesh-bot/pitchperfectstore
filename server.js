require('dotenv').config();
const express = require("express");
const app = express();
const session = require('express-session');
const passport = require('passport');
const PORT = process.env.PORT || 7000;
const flash = require('connect-flash');
const path = require('path');
const fs = require('fs');

const connectdb = require('./db/db.js');
const userRoutes = require("./route/user");
const adminRoutes = require("./route/admin");
const nocache = require('nocache');

// Connect to DB
connectdb();

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Set the view engine (EJS in this case)
app.set('view engine', 'ejs');

// Middleware
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport initialization (only once)
app.use(passport.initialize());
app.use(passport.session());

// Add these after your session middleware
app.use(flash());

// Add this near the top of your server.js
const uploadDir = path.join(__dirname, 'public', 'uploads', 'products');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});