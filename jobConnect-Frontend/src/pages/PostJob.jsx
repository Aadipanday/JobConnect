import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || user?.companyName || '',
    location: 'Bengaluru / Remote',
    jobType: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      setError('Please fill in Job Title, Company Name, and Job Description.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim() || 'Remote',
        jobType: formData.jobType,
        salary: formData.salary ? Number(formData.salary) : undefined,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
      };

      await api.post('/jobs', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/dashboard');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Failed to publish job opening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/recruiter/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recruiter Hub
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2-Columns: Job Posting Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Employer Studio
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Publish a New Job Opening
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Reach thousands of verified software engineers, designers, and product leaders.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Job listing published successfully! Redirecting to Recruiter Hub...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Position Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer (React/TypeScript)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hiring Company Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. FinTech Innovations"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Remote, San Francisco, Bengaluru"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employment Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Annual Salary (USD $)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g. 130000"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Description & Mission *
                </label>
                <textarea
                  rows={4}
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline the responsibilities, day-to-day work, and impact of this role..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Requirements & Tech Stack
                </label>
                <textarea
                  rows={3}
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Key required technologies, years of experience, qualification..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  to="/recruiter/dashboard"
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-60 transition"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Publish Job Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Job Card Preview */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-indigo-600" />
              Live Candidate Card Preview
            </div>

            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
                Preview
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                  {formData.company ? formData.company.charAt(0).toUpperCase() : 'C'}
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {formData.jobType}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {formData.title || 'Senior Software Engineer'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  {formData.company || 'Company Name'}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formData.location || 'Remote'}</span>
                </div>
                {formData.salary && (
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>${Number(formData.salary).toLocaleString()}/yr</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                {formData.description ||
                  'Your comprehensive job description will appear here on the public board for job seekers...'}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled
                  className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold cursor-default"
                >
                  View & Apply (Candidate Action)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
