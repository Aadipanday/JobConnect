import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    default: "Recruiter",
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const interviewSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 60,
  },
  location: {
    type: String,
    default: "Online Meeting",
  },
  attendees: {
    type: [String],
    default: [],
  },
  createCalendar: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate ID is required"],
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Applied",
        "Interview",
        "Rejected",
        "Hired",
        "pending",
        "accepted",
      ],
      default: "Applied",
    },
    statusHistory: [statusHistorySchema],
    notes: [noteSchema],
    interviews: [interviewSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate applications by the same candidate to the same job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
