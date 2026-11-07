import mongoose from "mongoose";

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const inMemoryUsers = new Map();
export const inMemoryPendingUsers = new Map();
export const inMemoryReports = new Map();

// Seed demo and guest users
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

