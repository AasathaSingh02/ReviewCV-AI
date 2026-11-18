import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { isDbConnected, inMemoryUsers } from "../utils/memoryStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "resumind-jwt-secret";

/**
 * Returns a strict ownership query filter:
 * - For authenticated users: { user: req.user._id }
 * - For guest sessions: { guestId: req.guestId }
 * - Otherwise null
 */
export const ownerFilter = (req) => {
  if (req.user?._id && !req.user?.isGuest) {
    return { user: req.user._id };
  }
  if (req.guestId) {
    return { guestId: req.guestId };
  }
  return null;
};

/**
 * Resolves or generates a secure server-side guest session
 */
const resolveGuestSession = (req, res, { isDemoToken = false } = {}) => {
  // If request specifically uses the demo token, provide deterministic guest session
  if (isDemoToken) {
    req.guestId = "guest-demo-user";
    req.user = { isGuest: true, guestId: "guest-demo-user", role: "guest" };
    return;
  }

  const existingCookie = req.cookies?.guest_token;
  const existingHeader = req.headers?.["x-guest-token"];
  const candidate = existingCookie || existingHeader;

  if (candidate) {
    try {
      const decoded = jwt.verify(candidate, JWT_SECRET);
      if (decoded && decoded.guestId) {
        req.guestId = decoded.guestId;
        req.user = { isGuest: true, guestId: decoded.guestId, role: "guest" };
        return;
      }
    } catch {
      // Invalid/expired token -> generate fresh session below
    }
  }

  // Generate a cryptographically random, server-owned guest ID
  const newGuestId = "guest_" + crypto.randomUUID();
  const signedToken = jwt.sign({ guestId: newGuestId }, JWT_SECRET, { expiresIn: "30d" });

  const isProd = process.env.NODE_ENV === "production";
  // Store in httpOnly cookie and set response header for cross-origin client fallback
  try {
    res.cookie("guest_token", signedToken, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
    });
    res.setHeader("x-guest-token", signedToken);
  } catch {
    // Response headers already sent in some test mocks
  }

  req.guestId = newGuestId;
  req.user = { isGuest: true, guestId: newGuestId, role: "guest" };
};

export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    // Check for guest authorization token
    if (authHeader && (authHeader === "Bearer guest-demo-token" || authHeader === "Bearer guest")) {
      resolveGuestSession(req, res, { isDemoToken: true });
      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If a guest cookie exists or request accepts guest mode, resolve guest
      if (req.cookies?.guest_token || req.headers?.["x-guest-token"]) {
        resolveGuestSession(req, res);
        return next();
      }
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    if (token === "guest-demo-token" || token === "guest") {
      resolveGuestSession(req, res, { isDemoToken: true });
      return next();
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    // If token is a guest session token
    if (decodedData.guestId) {
      req.guestId = decodedData.guestId;
      req.user = { isGuest: true, guestId: decodedData.guestId, role: "guest" };
      return next();
    }

    const userId = decodedData.id || decodedData._id;

    if (isDbConnected()) {
      try {
        const user = await User.findById(userId).select("-password");
        if (user) {
          req.user = user;
          return next();
        }
      } catch (dbErr) {
        console.warn("[AUTH] DB query failed, falling back to memory:", dbErr.message);
      }
    }

    // Check memory store fallback
    const memUser = inMemoryUsers.get(userId) || (decodedData.email && inMemoryUsers.get(decodedData.email));
    if (memUser) {
      req.user = memUser;
      return next();
    }

    // Fallback user from valid token payload
    req.user = {
      _id: userId,
      id: userId,
      email: decodedData.email || "user@resumind.ai",
      firstName: decodedData.firstName || "User",
      lastName: decodedData.lastName || "",
      role: decodedData.role || "user",
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Flexible middleware that attaches auth or guest identity without blocking
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return userAuth(req, res, next);
  }
  resolveGuestSession(req, res);
  next();
};

export const adminAuth = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};
