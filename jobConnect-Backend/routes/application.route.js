import express from "express";
import { getMyApplications } from "../controllers/candidate.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Candidate application dashboard (kept for backward compatibility)
router.get("/dashboard", protect, authorizeRoles("candidate"), getMyApplications);

export default router;
