import PendingUser from "../models/pendingUser.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { isDbConnected, inMemoryUsers, inMemoryPendingUsers } from "../utils/memoryStore.js";

const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();

export const verifyOtp = async (req, res) => {
  try {
    console.log('[VERIFY-OTP] Request received for email:', req.body.email);
    
    const { otp, email: rawEmail } = req.body;
    const email = normalizeEmail(rawEmail);

    if (!otp || !email) {
      return res.status(400).json({ error: "OTP and email are required" });
    }

    const dbAvailable = isDbConnected();
    let pendingUser = null;

    if (dbAvailable) {
      pendingUser = await PendingUser.findOne({ email });
    } else {
      pendingUser = inMemoryPendingUsers.get(email);
    }
    
    if (!pendingUser) {
      console.log('[VERIFY-OTP] No pending signup found for:', email);
      return res.status(400).json({ error: "No pending signup found. Please request a new OTP." });
    }
    
    if (String(pendingUser.otp).trim() !== String(otp).trim()) {
      console.log('[VERIFY-OTP] Invalid OTP provided for:', email);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (pendingUser.otpExpires && pendingUser.otpExpires < new Date()) {
      console.log('[VERIFY-OTP] OTP expired for:', email);
      if (dbAvailable) {
        await PendingUser.deleteOne({ email });
      } else {
        inMemoryPendingUsers.delete(email);
      }
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    let user = null;

    if (dbAvailable) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        await PendingUser.deleteOne({ email });
        return res.status(409).json({ error: "User already exists. Please login." });
      }

      user = await User.create({
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        email: pendingUser.email,
        password: pendingUser.password,
      });

      await PendingUser.deleteOne({ email });
    } else {
      user = {
        _id: "mem_" + Date.now(),
        id: "mem_" + Date.now(),
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        email: pendingUser.email,
        password: pendingUser.password,
        role: "user",
        avatar: "micah",
        createdAt: new Date(),
      };
      user.id = user._id;

      inMemoryUsers.set(email, user);
      inMemoryUsers.set(user._id, user);
      inMemoryPendingUsers.delete(email);
      console.log('[VERIFY-OTP] User created in Memory Store:', email);
    }

    // Attempt welcome email non-blockingly
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_resend_api_key')) {
      try {
        await sendEmail({
          to: user.email,
          subject: "🎉 Welcome to ReviewCV AI – AI Resume Analyzer",
          text: `Hi ${user.firstName}, welcome to ReviewCV AI! We're excited to have you onboard.`,
          html: `<h3>Welcome to ReviewCV AI, ${user.firstName}!</h3><p>Your account is ready.</p>`,
        });
      } catch (err) {
        console.warn('[VERIFY-OTP] Non-fatal email error:', err.message);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email },
      process.env.JWT_SECRET || "resumind-jwt-secret",
      { expiresIn: "7d" }
    );

    console.log('[VERIFY-OTP] Verification successful for:', email);
    
    return res.json({ 
      message: "Signup successful! Welcome to ReviewCV AI.", 
      token,
      user: {
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar || "micah",
        role: user.role || "user",
      }
    });

  } catch (error) {
    console.error('[VERIFY-OTP] Unexpected error:', error);
    return res.status(500).json({ 
      error: "An unexpected error occurred during verification.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
