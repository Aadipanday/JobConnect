import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import {
  getRecruiterJobs,
  getJobApplicants,
  updateApplicantStatus,
} from "../controllers/recruiter.controller.js";
import { applyForJob } from "../controllers/candidate.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/my-jobs", protect, authorizeRoles("recruiter", "admin"), getRecruiterJobs);
router.get("/:id", getJobById);

// Job creation & modification (Recruiter / Admin)
router.post("/create", protect, authorizeRoles("recruiter", "admin"), createJob);
router.put("/:id", protect, authorizeRoles("recruiter", "admin"), updateJob);
router.delete("/:id", protect, authorizeRoles("recruiter", "admin"), deleteJob);

// Candidate application
router.post("/:id/apply", protect, authorizeRoles("candidate"), applyForJob);

// Recruiter view & manage applicants for a job
router.get("/:id/applications", protect, authorizeRoles("recruiter", "admin"), getJobApplicants);
router.put(
  "/:jobId/applications/:appId/status",
  protect,
  authorizeRoles("recruiter", "admin"),
  (req, res, next) => {
    req.params.applicantId = req.params.appId;
    updateApplicantStatus(req, res, next);
  }
);

export default router;
