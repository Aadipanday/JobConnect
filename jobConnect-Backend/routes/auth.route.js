import express from "express";
import {
  signup,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public auth endpoints
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// Protected auth endpoints
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;