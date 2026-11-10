import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Briefcase, Sparkles } from 'lucide-react';

export const LiveDemoPreview: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Diagnostic Engine</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            See ReviewCV AI in Real-Time
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
            Our multi-tier engine scans structure, evaluates ATS keywords, and maps your skills directly to high-demand industry roles in seconds.
          </p>
        </motion.div>

        {/* 🖥️ Live Product Demo Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/40 dark:border-gray-700/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
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
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Mini Resume with Scanning Laser Bar */}
            <div className="md:col-span-5 relative p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-inner overflow-hidden">
              {/* Animated Scan Line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"
                animate={{ top: ["8%", "90%", "8%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="space-y-3.5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow">
                    AS
                  </div>
                  <div>
                    <div className="h-3.5 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mt-1.5" />
                  </div>
                </div>

                <div className="h-2 w-full bg-blue-500/20 rounded" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-2 w-4/6 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Clean single-column ATS layout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Quantified project bullet points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">100% Parsable fonts & structure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live ATS Results Card */}
            <div className="md:col-span-7 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-extrabold text-2xl shadow-lg">
                    92%
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      ATS Match Score
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      Recruiter-Ready (Top Tier)
                    </div>
                  </div>
                </div>

                <span className="text-xs font-medium px-3 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  ⚡ 0 Formatting Errors
                </span>
              </div>

              {/* Suggested Job Roles Pills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Matched Eligible Roles:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Full Stack Developer", "Frontend Engineer", "Node.js Architect"].map((role) => (
                    <span
                      key={role}
                      className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium shadow-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights / Strengths */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
                  <strong className="block font-semibold">14 Strong Action Verbs</strong>
                  <p className="text-[11px] opacity-80 mt-0.5">Architected, Spearheaded, Optimized</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                  <strong className="block font-semibold">Live Job Search Links</strong>
                  <p className="text-[11px] opacity-80 mt-0.5">1-click to LinkedIn, Naukri & Indeed</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

