import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * @desc    Get all jobs posted by the logged-in recruiter
 * @route   GET /api/recruiter/jobs or GET /api/job/my-jobs
 * @access  Private (Recruiter / Admin)
 */
export const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id }).sort("-createdAt");
  // If request accepts standard format or direct array
  // In our ApiResponse, jobs are in data and also returned appropriately
  return res
    .status(200)
    .json(new ApiResponse(200, jobs, "Recruiter jobs retrieved successfully"));
});

/**
 * @desc    Get all applicants for a specific job
 * @route   GET /api/recruiter/jobs/:jobId/applicants
 * @access  Private (Recruiter owner / Admin)
 */
export const getJobApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (
    job.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to view applicants for this job");
  }

  const applications = await Application.find({ job: jobId })
    .populate("candidate", "name email resumeUrl skills")
    .sort("-createdAt");

  const formattedApplicants = applications.map((app) => ({
    _id: app._id,
    name: app.candidate?.name || "Unknown Candidate",
    email: app.candidate?.email || "No Email",
    resumeUrl: app.resumeUrl || app.candidate?.resumeUrl || "",
    status: app.status,
    coverLetter: app.coverLetter,
    appliedAt: app.createdAt,
    applicationId: app._id,
    candidateId: app.candidate?._id,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedApplicants,
        "Applicants retrieved successfully"
      )
    );
});

/**
 * @desc    Get detailed applicant profile for CandidateModal
 * @route   GET /api/recruiter/applicants/:applicantId
 * @access  Private (Recruiter / Admin)
 */
export const getApplicantById = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;

  const application = await Application.findById(applicantId)
    .populate("candidate", "name email resumeUrl skills bio profileCompletion")
    .populate("job", "title company location");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const applicant = {
    _id: application._id,
    candidateId: application.candidate?._id,
    name: application.candidate?.name || "Unknown Candidate",
    email: application.candidate?.email || "",
    resumeUrl: application.resumeUrl || application.candidate?.resumeUrl || "",
    skills: application.candidate?.skills || [],
    bio: application.candidate?.bio || "",
    status: application.status,
    coverLetter: application.coverLetter,
    jobTitle: application.job?.title || "Job Posting",
    company: application.job?.company || "",
    appliedAt: application.createdAt,
    statusHistory: application.statusHistory || [],
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applicant,
        notes: application.notes || [],
        interviews: application.interviews || [],
        status: application.status,
      },
      "Applicant details retrieved successfully"
    )
  );
});

/**
 * @desc    Update applicant status (Applied, Interview, Rejected, Hired)
 * @route   PUT /api/recruiter/applicants/:applicantId/status
 * @access  Private (Recruiter / Admin)
 */
export const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;
  const { status, note } = req.body;

  if (!status) {
    throw new ApiError(400, "Please provide status");
  }

  const application = await Application.findById(applicantId)
    .populate("candidate", "name email")
    .populate("job", "title company");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  application.status = status;
  application.statusHistory.push({
    status,
    date: new Date(),
    note: note || `Status updated to ${status} by recruiter`,
  });

  await application.save();

  // Send non-blocking email notification to candidate if email available
  if (application.candidate?.email) {
    sendEmail({
      to: application.candidate.email,
      subject: `Application Update: ${application.job?.title || "Job"} at ${
        application.job?.company || "JobConnect"
      }`,
      text: `Hello ${
        application.candidate.name || "Candidate"
      },\n\nYour application status for "${
        application.job?.title
      }" has been updated to: ${status}.\n\nBest regards,\n${
        req.user.name || "Recruitment Team"
      }`,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        application,
        status: application.status,
      },
      `Applicant status updated to ${status}`
    )
  );
});

/**
 * @desc    Add an internal note to an applicant profile
 * @route   POST /api/recruiter/applicants/:applicantId/notes
 * @access  Private (Recruiter / Admin)
 */
export const addApplicantNote = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Note text is required");
  }

  const application = await Application.findById(applicantId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const newNote = {
    text: text.trim(),
    author: req.user.name || "Recruiter",
    authorId: req.user._id,
    createdAt: new Date(),
  };

  application.notes.unshift(newNote);
  await application.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        note: application.notes[0],
      },
      "Note added successfully"
    )
  );
});

/**
 * @desc    Delete an internal note from an applicant profile
 * @route   DELETE /api/recruiter/applicants/:applicantId/notes/:noteId
 * @access  Private (Recruiter / Admin)
 */
export const deleteApplicantNote = asyncHandler(async (req, res) => {
  const { applicantId, noteId } = req.params;

  const application = await Application.findById(applicantId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  application.notes = application.notes.filter(
    (n) => n._id.toString() !== noteId
  );
  await application.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

/**
 * @desc    Schedule interview for candidate
 * @route   POST /api/recruiter/applicants/:applicantId/interviews
 * @access  Private (Recruiter / Admin)
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;
  const { date, time, duration, location, attendees, createCalendar } = req.body;

  if (!date || !time) {
    throw new ApiError(400, "Date and time are required to schedule an interview");
  }

  const application = await Application.findById(applicantId)
    .populate("candidate", "name email")
    .populate("job", "title company");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const interviewData = {
    date,
    time,
    duration: Number(duration) || 60,
    location: location || "Online Meeting",
    attendees: Array.isArray(attendees) ? attendees : [],
    createCalendar: !!createCalendar,
    createdAt: new Date(),
  };

  application.interviews.unshift(interviewData);

  if (application.status === "Applied" || application.status === "pending") {
    application.status = "Interview";
    application.statusHistory.push({
      status: "Interview",
      date: new Date(),
      note: `Interview scheduled on ${date} at ${time}`,
    });
  }

  await application.save();

  const targetEmail = application.candidate?.email;
  if (targetEmail) {
    sendEmail({
      to: targetEmail,
      subject: `Interview Scheduled for ${application.job?.title || "Role"} at ${
        application.job?.company || "Company"
      }`,
      text:
        `Hello ${application.candidate?.name || "Candidate"},\n\n` +
        `Your interview for "${application.job?.title}" has been scheduled.\n\n` +
        `Date: ${date}\nTime: ${time}\nDuration: ${interviewData.duration} minutes\nLocation: ${interviewData.location}\n\n` +
        `Best regards,\n${req.user.name || "Recruitment Team"}`,
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        interview: application.interviews[0],
      },
      "Interview scheduled successfully"
    )
  );
});
