import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../models/User.js";
import { Otp } from "../models/OTP.js";

export const signupAdmin = async (req, res) => {
  try {
    const { fullname, instituteEmail, phoneNumber, avatar } = req.body;

    let existingUser = await User.findOne({ instituteEmail });

    if (existingUser) {
      if (
        existingUser.role === "Admin" ||
        existingUser.role === "Super Admin"
      ) {
        return res.status(400).json({
          message: "This account is already an administrator.",
        });
      }

      // If they already asked for an upgrade and are waiting.
      if (existingUser.accountStatus === "Pending") {
        return res.status(400).json({
          message:
            "An admin request for this account is already pending approval.",
        });
      }

      existingUser.role = "Admin";
      existingUser.accountStatus = "Pending";
      existingUser.phoneNumber = phoneNumber;
      if (avatar) existingUser.avatar = avatar;

      await existingUser.save();

      return res.status(200).json({
        message:
          "Upgrade request submitted! Your account is pending Super Admin approval.",
        user: {
          fullname: existingUser.fullname,
          email: existingUser.instituteEmail,
          status: existingUser.accountStatus,
        },
      });
    }

    const newUser = await User.create({
      fullname,
      instituteEmail,
      phoneNumber,
      avatar: avatar || "https://default-avatar-url.com/image.png",
      role: "Admin",
    });

    res.status(201).json({
      message:
        "Sign up successful! Your account is pending Super Admin approval.",
      user: {
        fullname: newUser.fullname,
        email: newUser.instituteEmail,
        status: newUser.accountStatus,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.phoneNumber) {
      return res
        .status(400)
        .json({
          message:
            "This phone number is already registered to another account.",
        });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

    if (user.accountStatus === "Pending") {
      return res.status(403).json({
        message: "Your account is still pending Super Admin approval.",
      });
    }

    if (user.accountStatus === "Rejected") {
      return res
        .status(403)
        .json({ message: "Your account request was rejected." });
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

    if (user.accountStatus === "Pending") {
      return res.status(403).json({
        message: "Your account is still pending Super Admin approval.",
      });
    }

    if (user.accountStatus === "Rejected") {
      return res
        .status(403)
        .json({ message: "Your account request was rejected." });
    }

    if (user.role !== "Admin" && user.role !== "Super Admin") {
      return res.status(403).json({
        message: "Access Denied. Your role may have changed during login.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, fullname: user.fullname, email: user.instituteEmail },
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
