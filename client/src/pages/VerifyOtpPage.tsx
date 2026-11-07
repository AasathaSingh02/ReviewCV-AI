import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { verifyOtp } from "@/app/features/otp/verifyOtp";
import { fetchCurrentUser, setCredentials } from "@/app/features/authSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.verifyOtp);

  const email = location.state?.email;
  const devOtp = location.state?.devOtp;

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    const result = await dispatch(verifyOtp({ email, otp: otpValue }));
    if (verifyOtp.fulfilled.match(result)) {
      toast.success("Account verified successfully!");
      if (result.payload.token) {
        localStorage.setItem("token", result.payload.token);
        await dispatch(fetchCurrentUser());
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleDirectAccess = () => {
    localStorage.setItem("token", "guest-demo-token");
    dispatch(
      setCredentials({
        user: {
          id: "guest-user",
          firstName: "Guest",
          lastName: "User",
          email: "guest@reviewcv.ai",
          role: "user",
          avatar: "micah",
        },
      })
    );
    toast.success("Direct access enabled — start analyzing resumes!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Verify OTP</CardTitle>
            <CardDescription className="text-gray-300">
              Enter the 6-digit code sent to <b>{email}</b>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <motion.div key={index} whileFocus={{ scale: 1.1 }}>
                  <Input
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="w-12 h-14 text-center text-lg font-semibold rounded-xl border border-white/30 bg-white/20 text-white focus:outline-none focus:border-purple-400"
                  />
                </motion.div>
              ))}
            </div>

            {/* Dev Mode Autofill Helper */}
            {devOtp && (
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={() => setOtp(String(devOtp).split("").slice(0, 6))}
                  className="text-xs bg-purple-500/20 text-purple-200 border border-purple-400/40 rounded-lg px-3 py-1.5 hover:bg-purple-500/40 transition-all cursor-pointer"
                >
                  ⚡ Dev Mode Code: <b>{devOtp}</b> (Click to auto-fill)
                </button>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-white/20 w-full"></div>
              <span className="bg-transparent px-3 text-xs uppercase text-gray-400">
                Or
              </span>
              <div className="border-t border-white/20 w-full"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDirectAccess}
              className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all text-xs py-2"
            >
              🚀 Skip & Upload Resume Directly
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
