import express from "express";
import { getMe, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
