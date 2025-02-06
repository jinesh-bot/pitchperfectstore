const mongoose = require('mongoose')

const Schema =mongoose.Schema;
const PostSchema =new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        sparse: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    otp: {
        code: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

// Add a method to check if OTP is expired
PostSchema.methods.isOTPExpired = function() {
    return !this.otp.expiresAt || this.otp.expiresAt < new Date();
};

module.exports= mongoose.model('users',PostSchema)