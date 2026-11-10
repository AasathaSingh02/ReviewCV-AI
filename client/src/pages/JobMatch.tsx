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
import { Loader2, MessageSquare, Target, Trash2, FileCheck2, Briefcase, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { JobMatchResult } from "@/types/JobMatchResult";
import { toast } from "sonner";
import { AnalysisProgressBar } from "@/components/AnalysisProgressBar";
import { useAnalysisProgress } from "@/hooks/useAnalysisProgress";

// Job board search URL builders
const JOB_BOARDS = [
  {
    name: "LinkedIn",
    icon: "💼",
    color: "text-blue-600 border-blue-500/40 hover:bg-blue-500/10",
    getUrl: (role: string) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=India`,
  },
  {
    name: "Naukri",
    icon: "🔍",
    color: "text-orange-600 border-orange-500/40 hover:bg-orange-500/10",
    getUrl: (role: string) =>
      `https://www.naukri.com/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, "-"))}-jobs`,
  },
  {
    name: "Indeed",
    icon: "🌐",
    color: "text-purple-600 border-purple-500/40 hover:bg-purple-500/10",
    getUrl: (role: string) =>
      `https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&l=India`,
  },
  {
    name: "Internshala",
    icon: "🎓",
    color: "text-green-600 border-green-500/40 hover:bg-green-500/10",
    getUrl: (role: string) =>
      `https://internshala.com/jobs/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, "-"))}`,
  },
  {
    name: "Glassdoor",
    icon: "🏢",
    color: "text-teal-600 border-teal-500/40 hover:bg-teal-500/10",
    getUrl: (role: string) =>
      `https://www.glassdoor.co.in/Job/india-${encodeURIComponent(role.toLowerCase().replace(/\s+/g, "-"))}-jobs-SRCH_IL.0,5_IN115_KO6,${6 + role.length}.htm`,
  },
];

// Extract likely job roles from resume analysis keywords + verdict
function deriveEligibleRoles(analysis: {
  matched_keywords?: string[];
  strengths?: string[];
  verdict_summary?: string;
  eligible_roles?: string[];
} | null | undefined): string[] {
  if (!analysis) return [];
  if (analysis.eligible_roles && analysis.eligible_roles.length > 0) {
    return analysis.eligible_roles.slice(0, 6);
  }
  // Derive from keywords heuristically
  const keywords = [
    ...(analysis.matched_keywords || []),
    ...(analysis.strengths || []),
  ].map((k) => k.toLowerCase());

  const roleMap: Record<string, string> = {
    react: "Frontend Developer",
    "next.js": "Full Stack Developer",
    nextjs: "Full Stack Developer",
    angular: "Frontend Developer",
    vue: "Frontend Developer",
    node: "Backend Developer",
    "node.js": "Backend Developer",
    express: "Backend Developer",
    python: "Python Developer",
    django: "Python Developer",
    flask: "Python Developer",
    java: "Java Developer",
    spring: "Java Developer",
    "machine learning": "ML Engineer",
    "deep learning": "ML Engineer",
    tensorflow: "ML Engineer",
    pytorch: "ML Engineer",
    "data science": "Data Scientist",
    sql: "Data Analyst",
    tableau: "Data Analyst",
    "power bi": "Data Analyst",
    aws: "Cloud Engineer",
    azure: "Cloud Engineer",
    gcp: "Cloud Engineer",
    kubernetes: "DevOps Engineer",
    docker: "DevOps Engineer",
    ci: "DevOps Engineer",
    android: "Android Developer",
    ios: "iOS Developer",
    flutter: "Flutter Developer",
    "react native": "Mobile Developer",
    cybersecurity: "Security Engineer",
    blockchain: "Blockchain Developer",
    ui: "UI/UX Designer",
    ux: "UI/UX Designer",
    figma: "UI/UX Designer",
  };

  const found = new Set<string>();
  for (const kw of keywords) {
    for (const [pattern, role] of Object.entries(roleMap)) {
      if (kw.includes(pattern)) found.add(role);
    }
  }
  return Array.from(found).slice(0, 6);
}

const JobMatch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { result, loading, error } = useAppSelector((state) => state.jobMatch);

  // ✅ Read previously-analyzed resume from Redux store
  const previousResumeData = useAppSelector((s) => s.resumeAnalysis.data);
  const historyData = useAppSelector((s) => s.resumeAnalysis.history);
  const previousResumeName = previousResumeData?.resumeName ?? historyData?.[0]?.resumeName;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { progress, stage, complete } = useAnalysisProgress(loading);

  // ✅ Derive eligible roles from the previous resume analysis
  const analysisSource = previousResumeData ?? historyData?.[0] ?? null;
  const eligibleRoles = deriveEligibleRoles(analysisSource?.analysis as Parameters<typeof deriveEligibleRoles>[0]);

  // ✅ When a role is selected from the eligible list, pre-fill job description prompt
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (!jobDescription.trim()) {
      setJobDescription(
        `Looking for a ${role} position. Please analyze my resume against typical ${role} job requirements including relevant skills, experience, and tools.`
      );
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

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

        {/* ✅ Eligible Roles Section — shown when resume was previously analyzed */}
        {eligibleRoles.length > 0 && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-foreground text-lg">
                Roles You're Eligible For
              </h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                Based on your resume
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Click a role to auto-fill the job description and explore openings on major job platforms:
            </p>
            <div className="flex flex-wrap gap-2">
              {eligibleRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    selectedRole === role
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-background border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  }`}
                >
                  {role}
                  {selectedRole === role && " ✓"}
                </button>
              ))}
            </div>

            {/* ✅ Job search links per role */}
            {selectedRole && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Search <strong>{selectedRole}</strong> openings on:
                </p>
                <div className="flex flex-wrap gap-2">
                  {JOB_BOARDS.map((board) => (
                    <a
                      key={board.name}
                      href={board.getUrl(selectedRole)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${board.color}`}
                    >
                      <span>{board.icon}</span>
                      {board.name}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                placeholder="Paste job description here... or select a role above to auto-fill."
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
              {/* ✅ Show job search links after analysis using matched keywords */}
              {result.result.matched_keywords && result.result.matched_keywords.length > 0 && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-500" />
                    Find Jobs Based on Your Match
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your resume matched well for this role. Search for similar openings:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_BOARDS.map((board) => (
                      <a
                        key={board.name}
                        href={board.getUrl(selectedRole || result.result.matched_keywords[0] || "software developer")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${board.color}`}
                      >
                        <span>{board.icon}</span>
                        {board.name}
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

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
