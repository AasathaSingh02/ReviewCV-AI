import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, CheckCircle2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook

type HeroProps = {
  onScrollTo?: (id: string) => void;
};

export const Hero: React.FC<HeroProps> = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate function

  const handleButtonClick = () => {
    navigate("/signup"); // ✅ Redirect to signup page
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background animations */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 rounded-3xl border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 shadow-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              AI-Powered Resume Analysis
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Get Your Resume{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-300% animate-gradient">
              ATS-Optimized
            </span>{" "}
            in Seconds
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Powered by AI. Built for recruiters and job seekers. Transform your
            resume into an ATS-friendly masterpiece that gets noticed.
          </motion.p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              onClick={handleButtonClick} // ✅ Navigate instead of scroll
              className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-5 w-5" />
              <span>Analyze My Resume Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              onClick={() => {
                localStorage.setItem("token", "guest-demo-token");
                navigate("/dashboard");
              }}
              className="inline-flex items-center space-x-2 px-6 py-4 rounded-2xl font-medium text-base text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Direct Upload (No Sign Up)</span>
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex justify-center items-center space-x-8 mt-12 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>10,000+ Resumes Analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>95% ATS Pass Rate</span>
            </div>
          </motion.div>

          {/* 🖥️ Live Product Demo Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3 }}
            className="mt-12 text-left rounded-2xl border border-white/30 dark:border-gray-700/40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/90" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/90" />
                <div className="w-3 h-3 rounded-full bg-green-400/90" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2">
                  ReviewCV AI — Realtime ATS Diagnostic
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                Live Scan Demo
              </span>
            </div>

            {/* Mock Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Mini Resume with Scanning Laser Bar */}
              <div className="md:col-span-5 relative p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-inner overflow-hidden">
                {/* Animated Scan Line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"
                  animate={{ top: ["8%", "90%", "8%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      AS
                    </div>
                    <div>
                      <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mt-1" />
                    </div>
                  </div>

                  <div className="h-2 w-full bg-blue-500/20 rounded" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-2 w-4/6 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Clean single-column ATS layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Quantified project bullet points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live ATS Results Card */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-extrabold text-xl shadow-lg">
                      92%
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                        ATS Match Score
                      </div>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        Recruiter-Ready (Top Tier)
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                    ⚡ 0 Formatting Errors
                  </span>
                </div>

                {/* Suggested Job Roles Pills */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Matched Eligible Roles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Full Stack Developer", "Frontend Engineer", "Node.js Architect"].map((role) => (
                      <span
                        key={role}
                        className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium shadow-xs"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights / Strengths */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
                    <strong>14 Strong Action Verbs</strong>
                    <p className="text-[11px] opacity-80 mt-0.5">Architected, Spearheaded, Optimized</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    <strong>Live Job Search Links</strong>
                    <p className="text-[11px] opacity-80 mt-0.5">1-click to LinkedIn & Naukri</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
