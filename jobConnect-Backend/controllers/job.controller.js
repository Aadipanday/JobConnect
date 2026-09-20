import Job from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all jobs with search, filtering, and pagination
 * @route   GET /api/job or GET /api/jobs
 * @access  Public
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    q,
    location,
    jobType,
    minSalary,
    maxSalary,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const query = { status: "active" };

  // Keyword full-text / regex search
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  // Job type filter
  if (jobType) {
    query.jobType = jobType;
  }

  // Salary filter
  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [jobs, totalJobs] = await Promise.all([
    Job.find(query)
      .populate("createdBy", "name email company")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: jobs.length,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limitNum),
        currentPage: pageNum,
        jobs,
      },
      "Jobs retrieved successfully"
    )
  );
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/job/:id
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "createdBy",
    "name email company"
  );

  if (!job) {
    throw new ApiError(404, "Job posting not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { job }, "Job details retrieved successfully"));
});

/**
 * @desc    Create a new job posting
 * @route   POST /api/job/create or POST /api/recruiter/post-job
 * @access  Private (Recruiter / Admin)
 */
export const createJob = asyncHandler(async (req, res) => {
  const { title, description, company, salary, location, jobType, requirements } =
    req.body;

  if (!title || !description || !company || !location) {
    throw new ApiError(
      400,
      "Please provide title, description, company, and location"
    );
  }

  const parsedRequirements = Array.isArray(requirements)
    ? requirements
    : requirements
    ? requirements.split(",").map((r) => r.trim())
    : [];

  const job = await Job.create({
    title,
    description,
    company,
    salary: salary ? Number(salary) : 0,
    location,
    jobType: jobType || "Full-time",
    requirements: parsedRequirements,
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        job,
        ...job.toObject(),
      },
      "Job posted successfully"
    )
  );
});

/**
 * @desc    Update a job posting
 * @route   PUT /api/job/:id
 * @access  Private (Recruiter owner / Admin)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (
    job.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to update this job posting");
  }

  const {
    title,
    description,
    company,
    salary,
    location,
    jobType,
    requirements,
    status,
  } = req.body;

  if (title) job.title = title;
  if (description) job.description = description;
  if (company) job.company = company;
  if (salary !== undefined) job.salary = Number(salary);
  if (location) job.location = location;
  if (jobType) job.jobType = jobType;
  if (status) job.status = status;
  if (requirements !== undefined) {
    job.requirements = Array.isArray(requirements)
      ? requirements
      : requirements.split(",").map((r) => r.trim());
  }

  const updatedJob = await job.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { job: updatedJob }, "Job updated successfully"));
});

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/job/:id
 * @access  Private (Recruiter owner / Admin)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (
    job.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to delete this job posting");
  }

  await job.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job deleted successfully"));
});
