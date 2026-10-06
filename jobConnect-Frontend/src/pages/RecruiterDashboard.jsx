import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  PlusCircle,
  X,
  FileText,
  ExternalLink,
  ChevronRight,
  MapPin,
  DollarSign,
  AlertCircle,
  Building,
  UserCheck,
  XCircle,
  Video,
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [error, setError] = useState('');

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: user?.companyName || '',
    location: 'Remote',
    salary: '',
    jobType: 'Full-time',
    description: '',
    requirements: '',
  });
  const [postJobLoading, setPostJobLoading] = useState(false);
  const [postJobError, setPostJobError] = useState('');
  const [jobStatusLoading, setJobStatusLoading] = useState(false);

  // Review Candidate Modal State (Mockup 2 Split Modal)
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [evalStatus, setEvalStatus] = useState('');
  const [evalNote, setEvalNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    try {
      setApplicantsLoading(true);
      const response = await api.get(`/recruiter/jobs/${job._id}/applicants`);
      const data = response?.data || response;
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const fetchRecruiterJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/recruiter/jobs');
      const data = response?.data || response;
      const jobList = Array.isArray(data) ? data : [];
      setJobs(jobList);

      // Auto-select first job if exists to show its applicants
      if (jobList.length > 0 && !selectedJob) {
        handleSelectJob(jobList[0]);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch recruiter jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);


  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setPostJobError('');

    if (!newJob.title || !newJob.company || !newJob.description) {
      setPostJobError('Please fill in job title, company name, and description.');
      return;
    }

    try {
      setPostJobLoading(true);
      const payload = {
        ...newJob,
        salary: newJob.salary ? Number(newJob.salary) : undefined,
      };

      await api.post('/jobs', payload);
      setIsPostJobModalOpen(false);
      setNewJob({
        title: '',
        company: user?.companyName || '',
        location: 'Remote',
        salary: '',
        jobType: 'Full-time',
        description: '',
        requirements: '',
      });
      fetchRecruiterJobs();
    } catch (err) {
      setPostJobError(err?.message || 'Failed to post job. Please try again.');
    } finally {
      setPostJobLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobToUpdate) => {
    if (!jobToUpdate) return;
    const newStatus = jobToUpdate.status === 'closed' ? 'active' : 'closed';
    const confirmMsg =
      newStatus === 'closed'
        ? `Are you sure you want to mark "${jobToUpdate.title}" as Filled / Closed? New candidates will no longer be able to apply.`
        : `Are you sure you want to reopen "${jobToUpdate.title}" for candidate applications?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setJobStatusLoading(true);
      await api.put(`/jobs/${jobToUpdate._id}`, { status: newStatus });
      setJobs((prevJobs) =>
        prevJobs.map((j) => (j._id === jobToUpdate._id ? { ...j, status: newStatus } : j))
      );
      if (selectedJob?._id === jobToUpdate._id) {
        setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err?.message || 'Failed to update job status.');
    } finally {
      setJobStatusLoading(false);
    }
  };

  const openReviewModal = (applicant) => {
    setSelectedApplicant(applicant);
    setEvalStatus(applicant.status || 'Applied');
    setEvalNote('');
    setInterviewDate('');
    setInterviewTime('');
    setInterviewLink('https://meet.google.com/xyz-job-conn');
    setModalSuccessMsg('');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApplicant) return;

    try {
      setStatusUpdateLoading(true);
      const statusToSet = newStatus || evalStatus;

      await api.put(`/recruiter/applicants/${selectedApplicant._id}/status`, {
        status: statusToSet,
        note: evalNote || `Status updated to ${statusToSet}`,
      });

      // Update local states
      setEvalStatus(statusToSet);
      setSelectedApplicant((prev) => ({ ...prev, status: statusToSet }));
      setApplicants((prev) =>
        prev.map((app) => (app._id === selectedApplicant._id ? { ...app, status: statusToSet } : app))
      );
      setModalSuccessMsg(`Candidate marked as "${statusToSet}" successfully!`);
      setTimeout(() => setModalSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApplicant || !interviewDate) return;

    try {
      setStatusUpdateLoading(true);
      await api.post(`/recruiter/schedule-interview/${selectedApplicant._id}`, {
        date: interviewDate,
        time: interviewTime || '11:00 AM',
        location: interviewLink || 'https://meet.google.com',
        note: evalNote,
      });

      setEvalStatus('Interview');
      setSelectedApplicant((prev) => ({ ...prev, status: 'Interview' }));
      setApplicants((prev) =>
        prev.map((app) => (app._id === selectedApplicant._id ? { ...app, status: 'Interview' } : app))
      );
      setModalSuccessMsg('Interview scheduled & invitation sent to candidate!');
      setTimeout(() => setModalSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to schedule interview.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Metrics computation
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter(
    (a) => (a.status || '').toLowerCase() === 'shortlisted'
  ).length;
  const interviewCount = applicants.filter((a) =>
    (a.status || '').toLowerCase().includes('interview')
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading Recruiter CRM Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Post Job CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Employer Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage company job openings, review applicants, and schedule candidate interviews.
            </p>
          </div>

          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job Opening
          </button>
        </div>

        {/* 4 Metric Stat Cards (UI Mockup 2) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{jobs.length}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Postings</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{totalApplicantsCount}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">Selected Job Candidates</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{shortlistedCount}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">Shortlisted</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{interviewCount}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">Interviews Slotted</p>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split CRM: Left = Jobs List, Right = Applicants Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Job Postings List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Your Job Postings ({jobs.length})
                </h3>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No jobs posted yet. Click "+ Post New Job Opening" to create your first posting.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {jobs.map((job) => {
                    const isSelected = selectedJob?._id === job._id;
                    return (
                      <div
                        key={job._id}
                        onClick={() => handleSelectJob(job)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {job.title}
                            </h4>
                            {job.status === 'closed' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                                Filled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{job.jobType || 'Full-time'}</span>
                            <span>•</span>
                            <span>{job.location || 'Remote'}</span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition ${
                            isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Applicants CRM Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedJob ? `Applicants for "${selectedJob.title}"` : 'Candidate Applicants'}
                    </h3>
                    {selectedJob && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedJob.status === 'closed'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {selectedJob.status === 'closed' ? 'Closed / Filled' : 'Active'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {applicants.length} candidate application{applicants.length === 1 ? '' : 's'}{' '}
                    received
                  </p>
                </div>

                {selectedJob && (
                  <button
                    onClick={() => handleToggleJobStatus(selectedJob)}
                    disabled={jobStatusLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedJob.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {jobStatusLoading ? (
                      'Updating...'
                    ) : selectedJob.status === 'closed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Reopen Job Opening
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Mark as Filled / Close Job
                      </>
                    )}
                  </button>
                )}
              </div>

              {applicantsLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Loading applicants...
                </div>
              ) : applicants.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No applicants for this position yet</p>
                  <p className="text-slate-400">Applications submitted by job seekers will show up here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-3">Candidate</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Resume</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applicants.map((applicant) => (
                        <tr key={applicant._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900 text-sm">{applicant.name}</p>
                            <p className="text-slate-400 text-[11px]">{applicant.email}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                (applicant.status || '').toLowerCase().includes('interview')
                                  ? 'bg-purple-100 text-purple-700'
                                  : (applicant.status || '').toLowerCase() === 'shortlisted'
                                  ? 'bg-amber-100 text-amber-700'
                                  : (applicant.status || '').toLowerCase().includes('hire')
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : (applicant.status || '').toLowerCase().includes('reject')
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {applicant.status || 'Applied'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {applicant.resumeUrl ? (
                              <a
                                href={applicant.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                              >
                                View CV <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => openReviewModal(applicant)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm transition"
                            >
                              Evaluate Candidate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post New Job Opening Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPostJobModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Create New Job Posting</h3>
            <p className="text-xs text-slate-500 mb-5">
              Publish an open position to thousands of active candidates on JobConnect.
            </p>

            {postJobError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{postJobError}</span>
              </div>
            )}

            <form onSubmit={handlePostJobSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    placeholder="e.g. Acme Innovations"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="e.g. Remote, San Francisco, etc."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Job Type
                  </label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Annual Salary (USD $)
                  </label>
                  <input
                    type="number"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g. 120000"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Job Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and team..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Requirements & Qualifications
                </label>
                <textarea
                  rows={3}
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  placeholder="Key technical skills, years of experience, degree, etc."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postJobLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition disabled:opacity-60"
                >
                  {postJobLoading ? 'Publishing...' : 'Publish Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Evaluation & Review Split Modal (UI Mockup 2) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApplicant(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {modalSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Column: Candidate Profile & Resume */}
              <div className="space-y-4 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                    {selectedApplicant.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedApplicant.name}</h3>
                    <p className="text-xs text-slate-500">{selectedApplicant.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Resume Document
                  </span>
                  {selectedApplicant.resumeUrl ? (
                    <a
                      href={selectedApplicant.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 text-indigo-600 font-semibold text-xs transition"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Open Candidate Resume URL
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No resume link provided.</p>
                  )}
                </div>

                {selectedApplicant.coverLetter && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Cover Letter
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                      {selectedApplicant.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Recruiter Decision CRM */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Evaluation Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Shortlisted')}
                      disabled={statusUpdateLoading}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        evalStatus === 'Shortlisted'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      Shortlist
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Interview')}
                      disabled={statusUpdateLoading}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        evalStatus === 'Interview'
                          ? 'bg-purple-50 border-purple-300 text-purple-800 ring-2 ring-purple-400/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      Interview
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Hired')}
                      disabled={statusUpdateLoading}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        evalStatus === 'Hired'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Offer / Hire
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Rejected')}
                      disabled={statusUpdateLoading}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        evalStatus === 'Rejected'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Schedule Interview Form */}
                <form onSubmit={handleScheduleInterview} className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Schedule Candidate Interview
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <input
                    type="url"
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    placeholder="Video meeting link (Google Meet / Zoom)"
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={statusUpdateLoading || !interviewDate}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Confirm Interview & Send Invite
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
