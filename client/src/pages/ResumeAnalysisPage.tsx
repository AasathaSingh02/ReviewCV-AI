import React from "react";
import { motion } from "framer-motion";
import UploadArea from "@/components/UploadArea";
import ScoreCard from "@/components/ScoreCard";
import Suggestions from "@/components/Suggestions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wand2Icon, RocketIcon, TimerIcon, Download, ExternalLink, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCurrent } from "@/app/features/resumeAnalysis/resumeAnalysisSlice";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/redux";

const ResumeAnalysisPage: React.FC = () => {
  const dispatch = useDispatch();
  const analysisData = useAppSelector((s) => s.resumeAnalysis.data);
  const rawResumeUrl = analysisData?.resumeUrl;

  const backendBase =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
    "https://reviewcv-ai.onrender.com";

  // Sanitize resumeUrl: if the backend sent a local URL (e.g. localhost:10000) while in production,
  // remap it to the actual public backend domain
  const sanitizeResumeUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith("blob:")) return url;

    // Check if the URL points to localhost while we have a remote backend
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
    if (isLocalhost && !backendBase.includes("localhost")) {
      const pathAfterHost = url.replace(/^https?:\/\/[^/]+/, "");
      return `${backendBase}${pathAfterHost.startsWith("/") ? "" : "/"}${pathAfterHost}`;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resumeUrl = sanitizeResumeUrl(rawResumeUrl);

  // ✅ Detect stale /uploads/ URLs — these point to Render's ephemeral filesystem
  // which gets wiped on restart. New uploads use /api/resume/file/:reportId instead.
  const isStaleUploadsUrl =
    resumeUrl !== null &&
    /\/uploads\/[^/]+\.pdf/i.test(resumeUrl) &&
    !resumeUrl.includes("cloudinary");

  const handleDownloadPdf = async () => {
    if (!resumeUrl) return;
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const downloadName = analysisData?.resumeName?.endsWith(".pdf")
        ? analysisData.resumeName
        : "resume.pdf";
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen text-foreground py-12 px-4 md:px-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* ⚡️ Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Supercharge Your Resume <br className="hidden md:block" />
            with <span className="text-primary">AI</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Get instant ATS score, suggestions, buzzword alerts, and
            recruiter-ready feedback.
          </motion.p>

          <motion.div
            className="flex justify-center flex-wrap gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Badge
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
            >
              <Wand2Icon className="h-4 w-4" /> AI-Powered Analysis
            </Badge>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow"
            >
              <RocketIcon className="h-4 w-4" /> ATS Optimization
            </Badge>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow"
            >
              <TimerIcon className="h-4 w-4" /> Instant Results
            </Badge>
          </motion.div>
        </motion.div>

        {/* 📝 Upload Area */}
        <UploadArea />

        {/* 📄 Resume Preview */}
        {resumeUrl && !isStaleUploadsUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-4"
          >
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                📄 Resume Preview
              </h3>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 text-blue-500 border-blue-500/40 hover:bg-blue-500 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(resumeUrl, "_blank")}
                  className="flex items-center gap-1.5 text-foreground hover:bg-muted"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 text-destructive border-destructive/40 hover:bg-destructive hover:text-white"
                  onClick={() => dispatch(clearCurrent())}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Analysis
                </Button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border shadow-xl bg-slate-900/30">
              <object
                data={`${resumeUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                width="100%"
                height="650px"
                className="rounded-lg w-full"
              >
                <iframe
                  src={`${resumeUrl}#toolbar=1`}
                  width="100%"
                  height="650px"
                  className="rounded-lg w-full"
                  title="Resume Preview"
                />
              </object>
            </div>
          </motion.div>
        )}

        {/* ⚠️ Stale resume URL warning — old uploads are gone from Render's ephemeral disk */}
        {isStaleUploadsUrl && (
          <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-foreground">
            <p className="font-semibold mb-1">⚠️ Resume Preview Unavailable</p>
            <p className="text-muted-foreground">
              The PDF file from your previous analysis is no longer available on the server.
              Please <strong>re-upload your resume</strong> above to generate a fresh analysis with a working preview.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-yellow-500/40 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
              onClick={() => dispatch(clearCurrent())}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear Stale Analysis
            </Button>
          </div>
        )}

        {/* 🧱 Separator */}
        <Separator className="my-6" />

        {/* 📊 Analysis Section */}
        <div className="space-y-8">
          <ScoreCard />
          <Suggestions />
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
