import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ResumeReport from "../src/models/ResumeReport.model.js";
import { findReportById, serveResumeFile, getResumeReports, getResumeReportById } from "../src/controllers/resume.controller.js";
import { ownerFilter } from "../src/middlewares/auth.middleware.js";
import { inMemoryReports, saveInMemoryReport, getInMemoryReport } from "../src/utils/memoryStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "resumind-jwt-secret";

describe("Resume API & Ownership Test Suite", () => {
  const samplePdfBase64 = Buffer.from("%PDF-1.4 sample pdf content").toString("base64");
  const authUserId1 = new mongoose.Types.ObjectId();
  const authUserId2 = new mongoose.Types.ObjectId();

  beforeEach(() => {
    inMemoryReports.clear();
  });

  // ==========================================
  // CROSS-GUEST TESTS (High Severity Risk)
  // ==========================================
  test("Cross-Guest: Guest A report must return 404 when requested by Guest B", async () => {
    const guestIdA = "guest_aaaa-1111";
    const guestIdB = "guest_bbbb-2222";
    const repId = "rep_guest_a_001";

    // Save report for Guest A in fallback store
    saveInMemoryReport(repId, {
      reportId: repId,
      guestId: guestIdA,
      user: null,
      fileData: samplePdfBase64,
      fileMimeType: "application/pdf",
      resumeName: "GuestA.pdf",
    });

    // Mock request from Guest B
    const reqB = {
      params: { reportId: repId },
      guestId: guestIdB,
      user: { isGuest: true, guestId: guestIdB, role: "guest" },
      cookies: {},
      headers: {},
    };

    let statusCode = 200;
    let jsonResult = null;

    const resB = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await getResumeReportById(reqB, resB);

    assert.equal(statusCode, 404, "Guest B must receive 404 for Guest A's report");
    assert.deepEqual(jsonResult, { error: "Report not found or unauthorized" });
  });

  test("Cross-Guest: Guest A's history must not include Guest B's reports", async () => {
    const guestIdA = "guest_aaaa-1111";
    const guestIdB = "guest_bbbb-2222";

    saveInMemoryReport("rep_a1", {
      reportId: "rep_a1",
      guestId: guestIdA,
      user: null,
      resumeName: "ResumeA.pdf",
      createdAt: new Date(),
    });

    saveInMemoryReport("rep_b1", {
      reportId: "rep_b1",
      guestId: guestIdB,
      user: null,
      resumeName: "ResumeB.pdf",
      createdAt: new Date(),
    });

    const reqA = {
      guestId: guestIdA,
      user: { isGuest: true, guestId: guestIdA, role: "guest" },
    };

    let jsonResult = null;
    const resA = {
      status() {
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await getResumeReports(reqA, resA);

    assert.ok(jsonResult && Array.isArray(jsonResult.reports), "Should return reports array");
    assert.equal(jsonResult.reports.length, 1, "Guest A should only see 1 report");
    assert.equal(jsonResult.reports[0].reportId, "rep_a1");
    assert.ok(!jsonResult.reports.some((r) => r.reportId === "rep_b1"), "Guest B report must not appear in Guest A history");
  });

  test("Guest Demo Token: Deterministic identity enables consistent history across requests", async () => {
    const repId = "rep_demo_1";
    saveInMemoryReport(repId, {
      reportId: repId,
      guestId: "guest-demo-user",
      user: null,
      resumeName: "DemoResume.pdf",
      createdAt: new Date(),
    });

    // Request from client with Bearer guest-demo-token (ownerFilter returns guestId: "guest-demo-user")
    const reqDemo = {
      guestId: "guest-demo-user",
      user: { isGuest: true, guestId: "guest-demo-user", role: "guest" },
    };

    let jsonResult = null;
    const resDemo = {
      status() {
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await getResumeReports(reqDemo, resDemo);

    assert.ok(jsonResult && Array.isArray(jsonResult.reports), "Should return reports array");
    assert.equal(jsonResult.reports.length, 1, "Demo guest should find their report in history");
    assert.equal(jsonResult.reports[0].reportId, "rep_demo_1");
  });

  // ==========================================
  // CUSTOM STRING & OBJECTID LOOKUPS
  // ==========================================
  test("Custom String Report IDs: Lookup works without CastError", async () => {
    const repId = "rep_" + Date.now();
    saveInMemoryReport(repId, {
      reportId: repId,
      guestId: "guest_session_123",
      resumeName: "TestCustomString.pdf",
    });

    const report = await findReportById(repId);
    assert.ok(report, "Must find report with custom string ID");
    assert.equal(report.reportId, repId);
  });

  test("Existing ObjectId-based reports: Lookup works seamlessly", async () => {
    const legacyObjectId = new mongoose.Types.ObjectId().toString();
    saveInMemoryReport(legacyObjectId, {
      _id: legacyObjectId,
      user: authUserId1,
      resumeName: "LegacyResume.pdf",
    });

    const report = await findReportById(legacyObjectId);
    assert.ok(report, "Must find legacy ObjectId report");
    assert.equal(report._id, legacyObjectId);
  });

  // ==========================================
  // AUTHENTICATED USERS
  // ==========================================
  test("Authenticated Users: History returns only authenticated user's reports", async () => {
    saveInMemoryReport("rep_user1", {
      reportId: "rep_user1",
      user: authUserId1,
      resumeName: "User1_Resume.pdf",
      createdAt: new Date(),
    });

    saveInMemoryReport("rep_user2", {
      reportId: "rep_user2",
      user: authUserId2,
      resumeName: "User2_Resume.pdf",
      createdAt: new Date(),
    });

    const reqUser1 = {
      user: { _id: authUserId1, role: "user" },
    };

    let jsonResult = null;
    const res = {
      status() {
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await getResumeReports(reqUser1, res);

    assert.ok(jsonResult?.reports);
    assert.equal(jsonResult.reports.length, 1);
    assert.equal(jsonResult.reports[0].reportId, "rep_user1");
  });

  // ==========================================
  // MISSING REPORTS
  // ==========================================
  test("Missing Reports: serveResumeFile returns 404 for non-existent report ID", async () => {
    const req = {
      params: { reportId: "rep_does_not_exist_9999" },
      guestId: "guest_anon",
      user: { isGuest: true, guestId: "guest_anon" },
      cookies: {},
      headers: {},
    };

    let statusCode = 200;
    let jsonResult = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await serveResumeFile(req, res);

    assert.equal(statusCode, 404);
    assert.deepEqual(jsonResult, { error: "Report not found" });
  });

  // ==========================================
  // RESUME PDF PREVIEW
  // ==========================================
  test("Resume PDF Preview: serveResumeFile sends application/pdf with buffer", async () => {
    const guestId = "guest_preview_test";
    const repId = "rep_pdf_preview_1";

    saveInMemoryReport(repId, {
      reportId: repId,
      guestId,
      fileData: samplePdfBase64,
      fileMimeType: "application/pdf",
      resumeName: "MyResume.pdf",
    });

    const req = {
      params: { reportId: repId },
      guestId,
      user: { isGuest: true, guestId },
      cookies: {},
      headers: {},
    };

    let sentHeaders = {};
    let sentBuffer = null;

    const res = {
      status() {
        return this;
      },
      set(headers) {
        sentHeaders = { ...sentHeaders, ...headers };
        return this;
      },
      send(data) {
        sentBuffer = data;
        return this;
      },
    };

    await serveResumeFile(req, res);

    assert.equal(sentHeaders["Content-Type"], "application/pdf");
    assert.ok(sentHeaders["Content-Disposition"].includes("MyResume.pdf"));
    assert.ok(Buffer.isBuffer(sentBuffer), "Sent data must be a Buffer");
    assert.equal(sentBuffer.toString(), "%PDF-1.4 sample pdf content");
  });

  // ==========================================
  // MONGODB UNAVAILABLE SCENARIO
  // ==========================================
  test("MongoDB Unavailable: Fallback handles query gracefully without crashing", async () => {
    // Stub readyState to disconnected (0)
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 0,
      configurable: true,
    });

    try {
      const repId = "rep_offline_mode";
      saveInMemoryReport(repId, {
        reportId: repId,
        guestId: "guest_offline",
        resumeName: "OfflineResume.pdf",
      });

      const report = await findReportById(repId);
      assert.ok(report, "Must resolve from in-memory fallback when MongoDB is offline");
      assert.equal(report.resumeName, "OfflineResume.pdf");
    } finally {
      Object.defineProperty(mongoose.connection, "readyState", {
        value: originalReadyState,
        configurable: true,
      });
    }
  });

  // ==========================================
  // SCHEMA VALIDATION (EITHER/OR)
  // ==========================================
  test("ResumeReport Schema: Requires exactly one of user or guestId", async () => {
    // Neither user nor guestId
    const invalidReportNone = new ResumeReport({
      reportId: "rep_none",
      aiFeedback: { score: 80 },
      score: 80,
    });
    let errNone = null;
    try {
      await invalidReportNone.validate();
    } catch (e) {
      errNone = e;
    }
    assert.ok(errNone, "Should fail validation when neither user nor guestId is provided");

    // Both user and guestId
    const invalidReportBoth = new ResumeReport({
      reportId: "rep_both",
      user: new mongoose.Types.ObjectId(),
      guestId: "guest_both",
      aiFeedback: { score: 80 },
      score: 80,
    });
    let errBoth = null;
    try {
      await invalidReportBoth.validate();
    } catch (e) {
      errBoth = e;
    }
    assert.ok(errBoth, "Should fail validation when both user and guestId are provided");

    // Valid authenticated user report
    const validAuthReport = new ResumeReport({
      reportId: "rep_valid_auth",
      user: new mongoose.Types.ObjectId(),
      aiFeedback: { score: 85 },
      score: 85,
    });
    await validAuthReport.validate(); // Should not throw

    // Valid guest report
    const validGuestReport = new ResumeReport({
      reportId: "rep_valid_guest",
      guestId: "guest_valid_123",
      aiFeedback: { score: 75 },
      score: 75,
    });
    await validGuestReport.validate(); // Should not throw
  });
});
