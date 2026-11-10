import bcrypt from "bcryptjs";
import PendingUser from "../models/pendingUser.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { isDbConnected, inMemoryUsers, inMemoryPendingUsers } from "../utils/memoryStore.js";

const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();

export const sendOtp = async (req, res) => {
    try {
        console.log('[SEND-OTP] Request received:', { email: req.body.email });
        
        const { firstName, lastName, email: rawEmail, password } = req.body;
        const email = normalizeEmail(rawEmail);

        // Validate all required fields
        if (!firstName || !lastName || !email || !password) {
            console.log('[SEND-OTP] Validation failed: Missing required fields');
            return res.status(400).json({ 
                error: "All fields are required",
                details: {
                    firstName: !firstName ? 'required' : 'ok',
                    lastName: !lastName ? 'required' : 'ok',
                    email: !email ? 'required' : 'ok',
                    password: !password ? 'required' : 'ok'
                }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('[SEND-OTP] Invalid email format:', email);
            return res.status(400).json({ error: "Invalid email format" });
        }

        const dbAvailable = isDbConnected();

        // Check if already registered
        if (dbAvailable) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('[SEND-OTP] User already exists:', email);
                return res.status(400).json({ error: "User already exists" });
            }
        } else if (inMemoryUsers.has(email)) {
            console.log('[SEND-OTP] (Memory) User already exists:', email);
            return res.status(400).json({ error: "User already exists" });
        }

        // Generate OTP & expiry
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        console.log('[SEND-OTP] Generated OTP for:', email);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save pending user
        if (dbAvailable) {
            await PendingUser.findOneAndDelete({ email });
            await PendingUser.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            });
            console.log('[SEND-OTP] Pending user created in DB');
        } else {
            inMemoryPendingUsers.set(email, {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            });
            console.log('[SEND-OTP] Pending user created in Memory Store');
        }

        // Check if Resend API key is configured
        const hasValidResendKey = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_resend_api_key');
        
        // Always use dev-mode fallback if no valid key (never crash on missing key)
        if (!hasValidResendKey) {
            console.log('\n==============================================');
            console.log(`⚡ [DEV MODE] No RESEND_API_KEY set. OTP for ${email}: ${otp}`);
            console.log('==============================================\n');
            return res.json({
                message: `OTP sent! Your verification code is ${otp}`,
                email,
                devOtp: otp,
            });
        }

        // Send OTP Email — always fall back gracefully if it fails
        console.log('[SEND-OTP] Attempting to send OTP email...');
        try {
            await sendEmail({
                to: email,
                subject: "Your ReviewCV AI Verification Code",
                text: `Hello ${firstName}, Your OTP is ${otp} (valid for 5 minutes).`,
                html: `
                <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px;">
                  <div style="
                    max-width: 500px; 
                    margin: auto; 
                    background: rgba(255, 255, 255, 0.15); 
                    border-radius: 15px; 
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                    backdrop-filter: blur(8px); 
                    -webkit-backdrop-filter: blur(8px);
                  ">
                    <h2 style="color: white; text-align: center;">🔐 Email Verification</h2>
                    <p style="color: white; text-align: center;">Hi <strong>${firstName}</strong>,</p>
                    <p style="color: white; text-align: center;">Use the following OTP to verify your email:</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <span style="
                        font-size: 26px; 
                        letter-spacing: 5px; 
                        font-weight: bold; 
                        color: white; 
                        background: rgba(255, 255, 255, 0.25);
                        border-radius: 10px; 
                        padding: 12px 20px;
                      ">
                        ${otp}
                      </span>
                    </div>
                    <p style="color: white; text-align: center;">This code will expire in <strong>5 minutes</strong>.</p>
                  </div>
                </div>
                `,
            });
            console.log('[SEND-OTP] OTP email sent successfully to:', email);
        } catch (emailError) {
            console.error('[SEND-OTP] Failed to send OTP email, falling back to devOtp:', {
                email,
                error: emailError.message,
            });
            
            // ✅ Email failed but OTP is saved — return devOtp so signup can still proceed
            // User will see the OTP in a toast notification
            return res.json({
                message: `OTP sent! Your verification code is ${otp}`,
                email,
                devOtp: otp,
                emailWarning: "Email delivery failed — using in-app OTP instead.",
            });
        }

        // Return success response
        console.log('[SEND-OTP] Process completed successfully for:', email);
        res.json({
            message: "OTP sent to email successfully",
            email, // frontend stores this for verify step
        });

    } catch (error) {
        console.error('[SEND-OTP] Unexpected error:', {
            error: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: "An unexpected error occurred. Please try again.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};