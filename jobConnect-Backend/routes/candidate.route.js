import express from "express";
import {
  getRecommendedJobs,
  getMyApplications,
  getMyInterviews,
  applyForJob,
} from "../controllers/candidate.controller.js";
import { updateProfile } from "../controllers/auth.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Recommended jobs (can be public or personalized if logged in)
router.get("/recommended-jobs", getRecommendedJobs);

// Candidate protected routes
router.use(protect, authorizeRoles("candidate"));

router.get("/applications", getMyApplications);
router.get("/interviews", getMyInterviews);
router.post("/apply/:jobId", applyForJob);
router.put("/profile", updateProfile);

export default router;
