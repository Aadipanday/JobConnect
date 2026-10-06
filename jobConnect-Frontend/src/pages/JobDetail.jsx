import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/jobs/${id}`);
        const data = response?.data || response;
        setJob(data?.job || data);

        // Pre-fill candidate's stored resume if available
        if (user?.resumeUrl) {
          setResumeUrl(user.resumeUrl);
        }

        // Check if current logged-in candidate already applied to this job
        if (isAuthenticated && user?.role === 'candidate') {
          try {
            const appsResponse = await api.get('/candidate/applications');
            const appsList = appsResponse?.data || appsResponse || [];
            const alreadyApplied = appsList.some(
              (app) => String(app.jobId || app.job?._id) === String(id)
            );
            if (alreadyApplied) {
              setHasApplied(true);
            }
          } catch (e) {
            // Non-critical check
          }
        }
      } catch (err) {
        setError(err?.message || 'Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, isAuthenticated, user]);

  const isJobOwner = Boolean(
    user &&
    job &&
    (String(job.createdBy?._id || job.createdBy) === String(user._id || user.id))
  );
  const isRecruiter = user?.role === 'recruiter';
  const isClosed = job?.status === 'closed';

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (isJobOwner) {
      navigate('/recruiter/dashboard');
      return;
    }
    if (user?.role !== 'candidate') {
      alert('Recruiter accounts cannot submit job applications. Please log in with a Candidate account.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');

    if (!resumeUrl.trim()) {
      setApplyError('Please provide a valid resume link (e.g. Google Drive, Dropbox, portfolio).');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/candidate/apply/${id}`, {
        resumeUrl: resumeUrl.trim(),
        coverLetter: coverLetter.trim(),
      });

      setApplySuccess(true);
      setHasApplied(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      setApplyError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'This job posting may have been removed.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>

        {/* Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0">
              {job.company?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {job.jobType || 'Full-time'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{job.title}</h1>
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                {job.company}
              </p>
            </div>
          </div>

          {/* Action Callout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isClosed ? (
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Position Filled / Closed
              </div>
            ) : isJobOwner ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Your Posted Job
                </span>
                <button
                  onClick={() => navigate('/recruiter/dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-[0.98] transition"
                >
                  Manage Job & Applicants
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : isRecruiter ? (
              <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                Recruiter View • Only Candidates Can Apply
              </div>
            ) : hasApplied ? (
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Already Applied
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-[0.98] transition"
              >
                Apply for this Position
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Annual Salary</p>
              <p className="text-sm font-bold text-slate-900">
                {job.salary ? `$${job.salary.toLocaleString()}` : 'Competitive'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Location</p>
              <p className="text-sm font-bold text-slate-900">{job.location || 'Remote'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Job Type</p>
              <p className="text-sm font-bold text-slate-900">{job.jobType || 'Full-time'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Posted Date</p>
              <p className="text-sm font-bold text-slate-900">
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements / Responsibilities */}
            {job.requirements && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Hiring Information
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Company</span>
                  <span className="font-semibold text-slate-800">{job.company}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Position Status</span>
                  <span className="font-semibold text-emerald-600 uppercase">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Job Reference ID</span>
                  <span className="font-mono text-slate-700">{job._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {applySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-sm text-slate-500">
                  Your application for <span className="font-semibold">{job.title}</span> has been
                  forwarded to the hiring recruiter.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Apply for {job.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.company} • {job.location}</p>
                </div>

                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Resume Link (URL) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or portfolio link"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Provide a public link to your resume (Google Drive, Dropbox, or personal website).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Cover Letter / Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the hiring manager why you are a great fit for this role..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-60 transition"
                  >
                    {submitting ? 'Submitting...' : 'Send Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
