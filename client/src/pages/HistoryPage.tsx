import {
  FileText,
  GaugeIcon,
  Trash2,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";

import {
  fetchResumeHistory,
  deleteResumeReport,
  reanalyzeResume,
  downloadReportPdf,
} from "@/app/features/resumeAnalysis/resumeAnalysisSlice";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatReadableDate, formatRelativeDate } from "@/utils/formatDate";

const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const { history, loading, error } = useAppSelector((s) => s.resumeAnalysis);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reAnalyzingId, setReAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchResumeHistory());
  }, [dispatch]);

  const handleReScore = async (reportId: string) => {
    setReAnalyzingId(reportId);
    const toastId = toast.loading("Re-analyzing resume...");
    try {
      await dispatch(reanalyzeResume(reportId)).unwrap();
      toast.success("✅ Resume re-analyzed successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(`❌ ${err.message}`);
      else toast.error("❌ Failed to re-analyze resume");
    } finally {
      toast.dismiss(toastId);
      setReAnalyzingId(null);
    }
  };

  const handleDelete = (reportId: string) =>
    dispatch(deleteResumeReport(reportId));

  const toggleExpand = (reportId: string) => {
    setExpanded((prev) => (prev === reportId ? null : reportId));
  };

  const handleDownload = async (reportId: string) => {
    const toastId = toast.loading("Preparing your PDF...");
    try {
      await dispatch(downloadReportPdf(reportId)).unwrap();
      toast.success("✅ Report downloaded!");
    } catch (err) {
      console.log(err)
      toast.error("❌ Failed to download PDF");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">📂 Resume History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(fetchResumeHistory())}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your resume history...</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <strong>Failed to load history:</strong> {error}
          <br />
          <span className="text-muted-foreground text-xs">Make sure you're logged in and the server is reachable.</span>
        </div>
      )}

      {history.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/30">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No resume history yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a resume on the <strong>Resume Analysis</strong> page to get started. <br />
            Your analysis will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((report) => (
            <div
              key={report.reportId}
              className="rounded-2xl border shadow-xl transition-all duration-300 p-4
                bg-muted/50 backdrop-blur-sm dark:bg-[#111827] border-border"
            >
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                    <FileText className="w-5 h-5 text-primary" /> Resume Report
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {formatRelativeDate(report.createdAt)}
                  </Badge>
                </div>
                {/* ✅ Resume Name */}
                {report.resumeName && (
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    📄 {report.resumeName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatReadableDate(report.createdAt)}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ATS Score:</span>
                  <span className="text-green-600 font-bold text-lg dark:text-green-400">
                    {report.analysis?.ats_score ?? "N/A"}%
                  </span>
                  <GaugeIcon className="text-green-600 dark:text-green-400 w-4 h-4" />
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => {
                      const url = report.resumeUrl;
                      if (!url) return;
                      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
                        window.open(url, "_blank");
                        return;
                      }
                      const backendBase =
                        import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
                        "http://localhost:5000";
                      const fullUrl = `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
                      window.open(fullUrl, "_blank");
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Resume
                  </Button>

                  <Button
                    variant="outline"
                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-500 hover:text-white"
                    onClick={() => handleReScore(report.reportId)}
                    disabled={reAnalyzingId === report.reportId}
                  >
                    {reAnalyzingId === report.reportId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Re-scoring...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-Score
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="text-indigo-600 border-indigo-600 hover:bg-indigo-600 hover:text-white"
                    onClick={() => handleDownload(report.reportId)}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Report
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => handleDelete(report.reportId)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => toggleExpand(report.reportId)}
                    className="text-primary hover:underline"
                  >
                    {expanded === report.reportId ? (
                      <>
                        Hide Details <ChevronUp className="ml-1 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="ml-1 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {expanded === report.reportId && (
                  <div className="space-y-3 text-sm text-foreground">
                    <p>
                      <strong>Verdict:</strong>{" "}
                      {report.analysis?.verdict_summary ?? "N/A"}
                    </p>
                    <p>
                      <strong>Tone:</strong>{" "}
                      {report.analysis?.tone_analysis ?? "N/A"}
                    </p>
                    <p>
                      <strong>Suggestions:</strong>{" "}
                      {report.analysis?.suggestions?.join("; ") || "None"}
                    </p>
                    <p>
                      <strong>Buzzwords:</strong>{" "}
                      {report.analysis?.buzzwords?.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Repeated Phrases:</strong>{" "}
                      {report.analysis?.repeated_phrases?.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Action Verbs:</strong>{" "}
                      {report.analysis?.action_verbs?.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Missing Sections:</strong>{" "}
                      {report.analysis?.missing_sections?.join(", ") || "None"}
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
