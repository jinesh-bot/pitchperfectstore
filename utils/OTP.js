const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Prime Pitch - Your OTP for Account Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1F4529;">Prime Pitch Account Verification</h2>
                    <p>Your OTP for account verification is:</p>
                    <h1 style="color: #780C28; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP will expire in 2 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error; // Throw error to handle it in the route
    }
};

module.exports = { generateOTP, sendOTP };