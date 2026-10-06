import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  MapPin,
  DollarSign,
  Building,
  Trash2,
  ArrowRight,
} from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobconnect_saved_jobs');
      if (stored) {
        setSavedJobs(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse saved jobs:', err);
    }
  }, []);

  const handleRemove = (jobId) => {
    const updated = savedJobs.filter((job) => job._id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem('jobconnect_saved_jobs', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved jobs?')) {
      setSavedJobs([]);
      localStorage.removeItem('jobconnect_saved_jobs');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
              <Bookmark className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
              Candidate Bookmarks
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Job Opportunities
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Positions you bookmarked to review or apply for later.
            </p>
          </div>

          {savedJobs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Bookmarks
            </button>
          )}
        </div>

        {/* Saved Jobs List or Empty State */}
        {savedJobs.length === 0 ? (
          <div className="bg-white p-12 sm:p-16 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Bookmarked Jobs Yet</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              When browsing through job listings, click the bookmark icon to save positions here for quick access later.
            </p>
            <div className="pt-2">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition"
              >
                Browse Job Board
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                      {job.company?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <button
                      onClick={() => handleRemove(job._id)}
                      title="Remove from saved jobs"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {job.company}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>${job.salary.toLocaleString()}/yr</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    View & Apply
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
