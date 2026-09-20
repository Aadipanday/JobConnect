import express from "express";
import {
  getRecruiterJobs,
  getJobApplicants,
  getApplicantById,
  updateApplicantStatus,
  addApplicantNote,
  deleteApplicantNote,
  scheduleInterview,
} from "../controllers/recruiter.controller.js";
import { createJob } from "../controllers/job.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// All recruiter routes require recruiter or admin role
router.use(protect, authorizeRoles("recruiter", "admin"));

// Jobs management
router.get("/jobs", getRecruiterJobs);
router.post("/post-job", createJob);
router.get("/jobs/:jobId/applicants", getJobApplicants);

// Applicant management
router.get("/applicants/:applicantId", getApplicantById);
router.put("/applicants/:applicantId/status", updateApplicantStatus);

// Internal notes
router.post("/applicants/:applicantId/notes", addApplicantNote);
router.delete("/applicants/:applicantId/notes/:noteId", deleteApplicantNote);

// Interviews
router.post("/applicants/:applicantId/interviews", scheduleInterview);

export default router;
