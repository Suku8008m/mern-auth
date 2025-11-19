//In this controller file we use different controller functions like
//1.Register,2.Login,3.Logout,4.verifyacc,5.Password reset
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  PASSWORD_RESET_TEMPLATE,
  WELCOME_EMAIL,
} from "../config/emailTemplates.js";
//1.Registration controller Function
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    //generate an access token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path:'/',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days to expire
    });
     res.json({ success: true });
    //Sending welcome Email start
    const mailOptions = {
      from: process.env.SENDER_EMAIL_ID,
      to: email,
      subject: "Welcome to GreatStack",
      text: `Welcome to GreatStact account and your account has created with email id:${email}`,
    };
    await transporter.sendMail(mailOptions);
    //Sending welcome Email end

   
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
    return res.json({ success: true });
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
  //1.getting userId
  //2.checking isAccountVerified in database
  //3.If not verified Generate OTP and OTP expire date
  //4.store otp and otpExpiry in database
  //5.send OTP to the mail
  try {
    const { userId } = req.body;
    return res.send(userId+" From send send verify otp")
    const user = await userModel.findById(userId);
    if (user.isVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6digit otp
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL_ID,
      to: user.email,
      subject: "Account Verification OTP",
      text: `your OTP is ${otp}.Verify your Account using this OTP`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification OTP Sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
    user.save();
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
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //6digit otp
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL_ID,
      to: user.email,
      subject: "Password Reset OTP",
      text: `your OTP for resetting your password is ${otp}.Reset your password using this OTP`,
      /* html: PASSWORD_RESET_TEMPLATE.replace("%FIRSTNAME|%", user.name)
        .replace("%LASTNAME|%", `<br/> Your OTP :- ${otp}`)
        .replace("your@mail.com", user.email),
   */
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP Sent on Email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
