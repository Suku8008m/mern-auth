//In this controller file we use different controller functions like
//1.Register,2.Login,3.Logout,4.verifyacc,5.Password reset
import bcrypt from "bcryptjs";
import axios from "axios";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

import {verifyEmailTemplate,PASSWORD_RESET_TEMPLATE,WELCOME_EMAIL} from '../config/emailTemplates.js';

//1.Registration controller Function
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // Generate an access token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Respond immediately
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, message: "User registered successfully" });

    // Send welcome email asynchronously
    axios
      .post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { email: process.env.SENDER_EMAIL_ID },
          to: [{ email: user.email }],
          subject: "Welcome to GreatStack",
          htmlContent: WELCOME_EMAIL.replace('[User Name]', user.name || ''),
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => console.log("Welcome email sent!"))
      .catch((err) => console.log("Email Error:", err.response?.data || err.message));
    
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//2.LoginIn controller Function

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid Email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    //generate an access token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path:"/",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days to expire
    });
    return res.json({ success: true ,message: "Login successful"});
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//3.LogOut controller Function

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite:  "none",
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//4.Email verification controller function
//Send verification otp to user account

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isVerified)
      return res.json({ success: false, message: "Already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Respond immediately
    res.json({ success: true, message: "OTP sent to your email" });

    // Send OTP using BREVO
    axios
      .post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { email:process.env.SENDER_EMAIL_ID},   // <--- works without custom domain
          to: [{ email: user.email }],
          subject: "Your OTP Code",
          htmlContent: verifyEmailTemplate.replace('{{OTP_CODE}}',otp)
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => console.log("Brevo email sent!"))
      .catch((err) => console.log("Email Error:", err.response?.data || err.message));

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Check if user is authenticated

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Respond immediately
    res.json({ success: true, message: "OTP sent to your email" });

    // Send OTP email asynchronously via BREVO
    axios
      .post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { email: process.env.SENDER_EMAIL_ID },
          to: [{ email: user.email }],
          subject: "Password Reset OTP",
          htmlContent:PASSWORD_RESET_TEMPLATE.replace('{{123}}', otp)
,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => console.log("Reset OTP email sent!"))
      .catch((err) => console.log("Email Error:", err.response?.data || err.message));

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      succcess: false,
      message: "Email,OTP ,and new Password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Templates
