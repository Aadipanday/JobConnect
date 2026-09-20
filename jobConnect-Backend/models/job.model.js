import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    salary: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },
    requirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text indexes for search capability
jobSchema.index({
  title: "text",
  company: "text",
  location: "text",
  description: "text",
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
