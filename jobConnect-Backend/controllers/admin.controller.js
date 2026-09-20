import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all users for Admin management table
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken")
    .sort("-createdAt");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

/**
 * @desc    Change user role (promote/demote between candidate, recruiter, admin)
 * @route   PUT /api/admin/promote/:id
 * @access  Private (Admin)
 */
export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ["candidate", "recruiter", "admin"];
  const targetRole = role || "recruiter";

  if (!validRoles.includes(targetRole)) {
    throw new ApiError(
      400,
      `Invalid role specified. Allowed roles: ${validRoles.join(", ")}`
    );
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (
    user._id.toString() === req.user._id.toString() &&
    targetRole !== "admin"
  ) {
    throw new ApiError(400, "You cannot demote your own admin account");
  }

  user.role = targetRole;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      `User ${user.name} role updated to ${targetRole}`
    )
  );
});

/**
 * @desc    Ban or unban a user / recruiter
 * @route   PUT /api/admin/ban-recruiter/:id
 * @access  Private (Admin)
 */
export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot ban yourself");
  }

  const isBanned = user.role === "banned" || user.status === "banned";
  user.role = isBanned ? "candidate" : "banned";
  user.status = isBanned ? "active" : "banned";
  if (!isBanned) {
    user.refreshToken = undefined;
  }
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      isBanned ? "User account unbanned" : "User account banned"
    )
  );
});

/**
 * @desc    Get admin dashboard with jobs and applications overview
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, location, recruiter } = req.query;

  const jobQuery = {};
  if (location) jobQuery.location = { $regex: location, $options: "i" };
  if (recruiter) jobQuery.createdBy = recruiter;

  const jobs = await Job.find(jobQuery)
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email role")
    .sort("-createdAt");

  const jobsWithApplications = await Promise.all(
    jobs.map(async (job) => {
      const appQuery = { job: job._id };
      if (status) appQuery.status = status;

      const applications = await Application.find(appQuery).populate(
        "candidate",
        "name email role resumeUrl"
      );

      return { job, applications };
    })
  );

  const totalJobs = await Job.countDocuments(jobQuery);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        totalPages: Math.ceil(totalJobs / limit),
        jobs: jobsWithApplications,
      },
      "Admin dashboard retrieved successfully"
    )
  );
});

/**
 * @desc    Delete any job by admin
 * @route   DELETE /api/admin/job/:id
 * @access  Private (Admin)
 */
export const deleteAnyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job and its applications deleted by admin"));
});

/**
 * @desc    Update application status by admin
 * @route   PUT /api/admin/application/:id/status
 * @access  Private (Admin)
 */
export const updateApplicationStatusByAdmin = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const { status } = req.body;
  if (!status) {
    throw new ApiError(400, "Please provide status");
  }

  application.status = status;
  application.statusHistory.push({
    status,
    date: new Date(),
    note: "Status updated by administrator",
  });

  const updatedApplication = await application.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { application: updatedApplication },
      "Application status updated by admin"
    )
  );
});

/**
 * @desc    Admin high-level analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const [
    totalJobs,
    totalApplications,
    totalRecruiters,
    totalCandidates,
    pendingCount,
    appliedCount,
    interviewCount,
    acceptedCount,
    rejectedCount,
    hiredCount,
  ] = await Promise.all([
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: "recruiter" }),
    User.countDocuments({ role: "candidate" }),
    Application.countDocuments({ status: "pending" }),
    Application.countDocuments({ status: "Applied" }),
    Application.countDocuments({ status: "Interview" }),
    Application.countDocuments({ status: "accepted" }),
    Application.countDocuments({ status: "rejected" }),
    Application.countDocuments({ status: "Hired" }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          jobs: totalJobs,
          applications: totalApplications,
          recruiters: totalRecruiters,
          candidates: totalCandidates,
        },
        applicationStatus: {
          pending: pendingCount,
          applied: appliedCount,
          interview: interviewCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
          hired: hiredCount,
        },
      },
      "Platform analytics retrieved successfully"
    )
  );
});

/**
 * @desc    Time-based analytics: jobs per month & applications per week
 * @route   GET /api/admin/analytics/time
 * @access  Private (Admin)
 */
export const getTimeAnalytics = asyncHandler(async (req, res) => {
  const jobsPerMonth = await Job.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  const applicationsPerWeek = await Application.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.week": -1 } },
    { $limit: 12 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobsPerMonth,
        applicationsPerWeek,
      },
      "Time-based analytics retrieved successfully"
    )
  );
});
