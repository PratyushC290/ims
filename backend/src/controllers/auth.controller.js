import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../models/User.js";
import { Otp } from "../models/OTP.js";

const sendOtpEmail = async (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your IMS Login OTP",
    text: `${otpCode} is your OTP for the Inventory Management System. It expires in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ instituteEmail: email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role !== "Admin" && user.role !== "Super Admin") {
      return res.status(403).json({
        message: "Access Denied.",
      });
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otpCode });

    try {
      await sendOtpEmail(email, otpCode);
    } catch (emailError) {
      await Otp.deleteMany({ email });
      throw emailError;
    }

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const validOtp = await Otp.findOne({ email });

    if (!validOtp) {
      return res
        .status(400)
        .json({ message: "No active OTP found or it has expired." });
    }

    if (validOtp.attempts >= 5) {
      await Otp.deleteOne({ _id: validOtp._id });
      return res.status(403).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (validOtp.otpCode !== otpCode) {
      validOtp.attempts += 1;
      await validOtp.save(); 

      const remaining = 5 - validOtp.attempts;
      return res.status(400).json({
        message: `Incorrect OTP. You have ${remaining} attempt(s) remaining.`,
      });
    }

    const user = await User.findOne({ instituteEmail: email });

    if (user.role !== "Admin" && user.role !== "Super Admin") {
      return res.status(403).json({
        message: "Access Denied. Your role may have changed during login.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    await Otp.deleteOne({ _id: validOtp._id });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
