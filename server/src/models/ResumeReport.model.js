import mongoose from "mongoose";

const resumeReportSchema = new mongoose.Schema({
  // Legacy / custom string identifier (rep_...) for external URLs & frontend routing
  reportId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  // Authenticated user reference (optional, exactly one of user or guestId required)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // Scoped guest session identifier (optional, exactly one of user or guestId required)
  guestId: {
    type: String,
    index: true,
    default: null,
  },
  fileUrl: {
    type: String,
    default: "",
  },
  // Store PDF base64 / buffer data for persistent serving without ephemeral local disk
  fileData: {
    type: String,
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
  resumeName: {
    type: String,
  },
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

// Validator: Exactly one of `user` or `guestId` must be set
resumeReportSchema.pre("validate", function (next) {
  if (!this.user && !this.guestId) {
    return next(new Error("ResumeReport must have either user or guestId"));
  }
  if (this.user && this.guestId) {
    return next(new Error("ResumeReport cannot have both user and guestId"));
  }
  next();
});

const ResumeReport = mongoose.model("ResumeReport", resumeReportSchema);
export default ResumeReport;
