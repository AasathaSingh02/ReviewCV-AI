import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isDbConnected, inMemoryUsers } from "../utils/memoryStore.js";

export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // Support guest token
    if (token === "guest-demo-token" || token === "guest") {
      req.user = inMemoryUsers.get("guest@reviewcv.ai") || {
        _id: "guest-user-id-001",
        id: "guest-user-id-001",
        firstName: "Guest",
        lastName: "User",
        email: "guest@reviewcv.ai",
        role: "user",
        avatar: "micah",
      };
      return next();
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET || "resumind-jwt-secret");
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



export const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};
