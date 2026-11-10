import mongoose from "mongoose";

const resumeReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  // ✅ Store PDF as base64 when Cloudinary is not configured (Render ephemeral FS fix)
  fileData: {
    type: String, // base64 encoded PDF
    default: null,
  },
  fileMimeType: {
    type: String,
    default: "application/pdf",
  },
  aiFeedback: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  resumeName: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rewrites: [
  {
    original: String,
    rewritten: String,
    createdAt: { type: Date, default: Date.now },
  },
],
});

const ResumeReport = mongoose.model("ResumeReport", resumeReportSchema);
export default ResumeReport;

