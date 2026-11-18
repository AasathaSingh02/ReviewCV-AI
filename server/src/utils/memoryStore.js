import mongoose from "mongoose";

// Check if MongoDB connection is open and ready (avoiding Mongoose 10s command buffering on down DB)
export const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

export const inMemoryUsers = new Map();
export const inMemoryPendingUsers = new Map();

// Capped in-memory report store with TTL (ephemeral RAM-only fallback)
const MAX_MEM_REPORTS = 50;
const REPORT_TTL_MS = 60 * 60 * 1000; // 1 hour

export const inMemoryReports = new Map();

export const saveInMemoryReport = (key, report) => {
  if (inMemoryReports.size >= MAX_MEM_REPORTS) {
    const oldestKey = inMemoryReports.keys().next().value;
    inMemoryReports.delete(oldestKey);
  }
  inMemoryReports.set(String(key), {
    ...report,
    _memSavedAt: Date.now(),
  });
  console.warn(`[FALLBACK] Report stored in temporary RAM fallback (Key: ${key}). Data will NOT persist across server restarts.`);
};

export const getInMemoryReport = (key) => {
  const item = inMemoryReports.get(String(key));
  if (!item) return null;
  if (Date.now() - (item._memSavedAt || 0) > REPORT_TTL_MS) {
    inMemoryReports.delete(String(key));
    return null;
  }
  return item;
};

// Seed demo user
const guestUser = {
  _id: "guest-user-id-001",
  id: "guest-user-id-001",
  firstName: "Guest",
  lastName: "User",
  email: "guest@reviewcv.ai",
  role: "user",
  avatar: "micah",
  createdAt: new Date(),
};

inMemoryUsers.set("guest@reviewcv.ai", guestUser);
inMemoryUsers.set("guest-user-id-001", guestUser);
