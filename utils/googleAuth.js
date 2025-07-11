const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/usermodel');
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

passport.use(
    new GoogleStrategy(
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // If user exists but was created through regular signup
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                } else {
                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        isVerified: true, // Google accounts are pre-verified
                        password: Math.random().toString(36).slice(-8), // Random password for Google users
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const app = require('express')();
app.use(passport.initialize());
app.use(passport.session());