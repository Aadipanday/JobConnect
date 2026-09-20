import express from "express";
import {
  getAllUsers,
  changeUserRole,
  banUser,
  getAdminDashboard,
  deleteAnyJob,
  updateApplicationStatusByAdmin,
  getPlatformAnalytics,
  getTimeAnalytics,
} from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.put("/promote/:id", changeUserRole);
router.put("/ban-recruiter/:id", banUser);

// Dashboard & Moderation
router.get("/dashboard", getAdminDashboard);
router.delete("/job/:id", deleteAnyJob);
router.put("/application/:id/status", updateApplicationStatusByAdmin);

// Analytics
router.get("/analytics", getPlatformAnalytics);
router.get("/analytics/time", getTimeAnalytics);

export default router;
