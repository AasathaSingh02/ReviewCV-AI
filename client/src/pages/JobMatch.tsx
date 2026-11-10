// ✅ JobMatch.tsx — Connected to Redux Slice with Glassmorphism Result UI

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { PdfUpload } from "@/components/job-match/PdfUpload";
import { AnalysisResult } from "@/components/job-match/AnalysisResult";
import {
  submitJobMatch,
  clearJobMatch,
  restoreJobMatch,
} from "@/app/features/jobMatchSlice";
import { Loader2, MessageSquare, Target, Trash2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobMatchResult } from "@/types/JobMatchResult";
import { toast } from "sonner";
import { AnalysisProgressBar } from "@/components/AnalysisProgressBar";
import { useAnalysisProgress } from "@/hooks/useAnalysisProgress";

const JobMatch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { result, loading, error } = useAppSelector((state) => state.jobMatch);

  // ✅ Read previously-analyzed resume from Redux store
  const previousResumeData = useAppSelector((s) => s.resumeAnalysis.data);
  const previousResumeName = previousResumeData?.resumeName;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const { progress, stage, complete } = useAnalysisProgress(loading);

  // Auto-select existing resume if available and no file chosen yet
  useEffect(() => {
    if (previousResumeName && !selectedFile) {
      setUseExistingResume(true);
    }
  }, [previousResumeName, selectedFile]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

    // If using existing resume from analysis, we still need a file for the API
    // We'll send just the job description context — but the backend requires a PDF.
    // So we disable useExistingResume flow if no file. User must upload.
    if (!selectedFile) {
      toast.error("Please upload your resume PDF to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);

    const toastId = toast.loading("Matching resume with job...");
    try {
      await dispatch(submitJobMatch(formData)).unwrap();
      complete();
      toast.success("Job match analysis complete!", { id: toastId });
    } catch (err) {
      toast.error("Job match failed", {
        id: toastId,
        description: typeof err === "string" ? err : "Please try again.",
      });
    }
  };

  // ✅ Restore from localStorage on initial mount
  useEffect(() => {
    const stored = localStorage.getItem("jobMatchResult");
    if (stored) {
      const parsed: JobMatchResult = JSON.parse(stored);
      dispatch(restoreJobMatch(parsed));
    }
  }, [dispatch]);

  const canSubmit = selectedFile && jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            🎯 AI Job Match Analyzer
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your resume and paste the job description to get an instant
            AI-powered job fit analysis.
          </p>
        </div>

        <div className="space-y-6 animate-slide-in">
          <div className="space-y-2">
            <Label className="text-lg flex items-center gap-2">📄 Upload Resume</Label>

            {/* ✅ Show previous resume info if available */}
            {previousResumeName && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm">
                <FileCheck2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  Previously analyzed: <strong className="text-foreground">{previousResumeName}</strong>
                </span>
                <span className="text-xs text-muted-foreground ml-auto">(Upload a new PDF below to analyze a different resume)</span>
              </div>
            )}

            <PdfUpload selectedFile={selectedFile} onFileSelect={setSelectedFile} />
          </div>

          <div className="space-y-2">
            <Label className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Job Description
            </Label>
            <div className="glass-card p-6 backdrop-blur-md bg-white/10 dark:bg-zinc-900/30 rounded-xl border border-white/10 shadow-xl">
              <Textarea
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[180px] bg-transparent border border-border rounded-md px-4 py-2 focus-visible:ring-1 focus-visible:ring-primary text-sm resize-none"
              />
              <div className="text-sm text-muted-foreground text-right mt-1">
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          <div className="text-center flex flex-wrap justify-center items-center gap-4">
            <Button
              onClick={handleAnalyze}
              disabled={!canSubmit || loading}
              className={`px-10 py-5 text-lg font-medium transition-all duration-300 rounded-xl shadow-md ${
                canSubmit
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 hover:scale-105"
                  : "bg-muted"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Match Resume with Job
                </>
              )}
            </Button>

            {result && (
              <Button
                onClick={() => dispatch(clearJobMatch())}
                variant="destructive"
                className="px-6 py-5 rounded-xl"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear Result
              </Button>
            )}
          </div>

          {loading && <AnalysisProgressBar progress={progress} stage={stage} />}

          {error && (
            <p className="text-destructive text-center text-sm rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-12 space-y-8">
              <AnalysisResult
                score={result.result.score}
                missingKeywords={result.result.missing_keywords}
                matchedKeywords={result.result.matched_keywords}
                strengths={result.result.strengths}
                weaknesses={result.result.weaknesses}
                suggestions={result.result.suggestions}
                verdict={result.result.verdict_summary}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatch;
