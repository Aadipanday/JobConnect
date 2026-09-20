import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get recommended jobs for candidate based on skills or latest postings
 * @route   GET /api/candidate/recommended-jobs
 * @access  Public / Private (Candidate)
 */
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  let query = { status: "active" };

  if (req.user && req.user.skills && req.user.skills.length > 0) {
    const skillRegexes = req.user.skills.map((s) => new RegExp(s, "i"));
    query.$or = [
      { requirements: { $in: skillRegexes } },
      { title: { $in: skillRegexes } },
      { description: { $in: skillRegexes } },
    ];
  }

  let jobs = await Job.find(query).sort("-createdAt").limit(10);

  if (jobs.length === 0) {
    jobs = await Job.find({ status: "active" }).sort("-createdAt").limit(10);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, jobs, "Recommended jobs retrieved successfully"));
});

/**
 * @desc    Get candidate's submitted applications
 * @route   GET /api/candidate/applications or GET /api/application/dashboard
 * @access  Private (Candidate)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("job", "title company location salary status")
    .sort("-createdAt");

  const formattedApplications = applications.map((app) => ({
    _id: app._id,
    jobId: app.job?._id,
    jobTitle: app.job?.title || "Job Unavailable",
    company: app.job?.company || "Company",
    location: app.job?.location || "",
    salary: app.job?.salary || 0,
    status: app.status,
    appliedAt: app.createdAt,
    resumeUrl: app.resumeUrl,
    coverLetter: app.coverLetter,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedApplications,
        "Candidate applications retrieved successfully"
      )
    );
});

/**
 * @desc    Get candidate's scheduled interviews
 * @route   GET /api/candidate/interviews
 * @access  Private (Candidate)
 */
export const getMyInterviews = asyncHandler(async (req, res) => {
  const applications = await Application.find({
    candidate: req.user._id,
    "interviews.0": { $exists: true },
  }).populate("job", "title company location");

  const interviewsList = [];
  applications.forEach((app) => {
    (app.interviews || []).forEach((interview) => {
      interviewsList.push({
        _id: interview._id,
        applicationId: app._id,
        jobId: app.job?._id,
        jobTitle: app.job?.title || "Position",
        company: app.job?.company || "Company",
        date: interview.date,
        time: interview.time,
        duration: interview.duration,
        location: interview.location,
        createdAt: interview.createdAt,
      });
    });
  });

  interviewsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interviewsList,
        "Candidate interviews retrieved successfully"
      )
    );
});

/**
 * @desc    Apply for a job posting
 * @route   POST /api/candidate/apply/:jobId or POST /api/job/:id/apply
 * @access  Private (Candidate)
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId || req.params.id;
  const { coverLetter, resumeUrl } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.status === "closed") {
    throw new ApiError(400, "This job posting has been closed");
  }

  // Check duplicate application
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied for this job");
  }

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    coverLetter: coverLetter || "",
    resumeUrl: resumeUrl || req.user.resumeUrl || "",
    status: "Applied",
    statusHistory: [
      {
        status: "Applied",
        date: new Date(),
        note: "Application submitted by candidate",
      },
    ],
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        application,
      },
      "Application submitted successfully"
    )
  );
});
