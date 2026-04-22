import express from "express";
import rateLimit from "express-rate-limit";
import { requestOtp, signupAdmin, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", signupAdmin);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

export default router;
