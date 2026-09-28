import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  ArrowRight,
  Building,
  MapPin,
  ExternalLink,
  Award,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        setError('');

        const [appsRes, interviewsRes] = await Promise.all([
          api.get('/candidate/applications').catch(() => ({ data: [] })),
          api.get('/candidate/interviews').catch(() => ({ data: [] })),
        ]);

        const appsList = appsRes?.data || appsRes || [];
        const interviewsList = interviewsRes?.data || interviewsRes || [];

        setApplications(Array.isArray(appsList) ? appsList : []);
        setInterviews(Array.isArray(interviewsList) ? interviewsList : []);
      } catch (err) {
        setError(err?.message || 'Failed to load candidate dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('interview')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Interview Scheduled
        </span>
      );
    }
    if (s.includes('hire') || s.includes('offer')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Offer Received
        </span>
      );
    }
    if (s.includes('reject')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Not Selected
        </span>
      );
    }
    if (s.includes('review') || s.includes('shortlist')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Under Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        Applied
      </span>
    );
  };

  // Sample skills if candidate hasn't configured them yet
  const candidateSkills =
    user?.skills && user.skills.length > 0
      ? user.skills
      : ['React', 'Node.js', 'TypeScript', 'TailwindCSS', 'REST APIs'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading your candidate portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header / Profile Health Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome & Profile Completion */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Candidate Portal
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Welcome, {user?.name || 'Candidate'}!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track your active job applications and interview schedules.
              </p>
            </div>

            {/* Profile Completion Circle */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 stroke-current"
                    strokeDasharray="85, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-800">85%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Profile Health</p>
                <p className="text-[11px] text-slate-500">
                  {user?.resumeUrl ? 'Resume attached' : 'Add your portfolio & resume'}
                </p>
              </div>
            </div>

            {/* Skills Badges */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Active Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidateSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Highlights */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{applications.length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-1">
                  Submitted Applications
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{interviews.length}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-1">
                  Scheduled Interviews
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">
                  {applications.filter((a) => (a.status || '').toLowerCase().includes('interview') || (a.status || '').toLowerCase().includes('offer')).length}
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-1">
                  In Progress / Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Upcoming Interviews
            </h2>
          </div>

          {interviews.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center py-8">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No interviews scheduled yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                When recruiters schedule an interview, it will appear here with a video link.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {item.date ? new Date(item.date).toLocaleDateString() : 'Scheduled Date'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.time || '10:00 AM PST'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.jobTitle}</h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      {item.company}
                    </p>
                  </div>

                  <a
                    href={item.location?.startsWith('http') ? item.location : 'https://meet.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Video className="w-4 h-4" />
                    Join Google Meet
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Applications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Active Job Applications
            </h2>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Discover more jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You haven't applied to any jobs yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore hundreds of verified roles in tech, product, and engineering.
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Browse Job Board
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{app.jobTitle}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {app.company}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {app.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Applied on{' '}
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Resume
                        </a>
                      )}
                      {app.jobId && (
                        <Link
                          to={`/jobs/${app.jobId}`}
                          className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          View Job
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
