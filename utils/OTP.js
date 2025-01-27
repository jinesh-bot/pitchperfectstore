const nodemailer = require("nodemailer");
const dotenv=require('dotenv')
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});
 const generateOTP=()=>{
    return Math.floor(1000 + Math.random() * 9000).toString();
 }
const sendOTP=async(email,otp)=>{
  try{
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP for verification",
        text: `Your OTP is ${otp}`,
      };
      await transporter.sendMail(mailOptions);
  }catch(error){
    console.error("Error sending OTP:", error);
  }
}
module.exports={generateOTP,sendOTP}