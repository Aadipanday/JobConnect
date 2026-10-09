import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Filter,
  ArrowRight,
  RotateCcw,
  Building,
  X,
} from 'lucide-react';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSort, setSelectedSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('jobconnect_saved_jobs') || '[]');
      setSavedIds(stored.map((j) => j._id));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSaveJob = (e, job) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem('jobconnect_saved_jobs') || '[]');
      const exists = stored.some((j) => j._id === job._id);
      let updated;
      if (exists) {
        updated = stored.filter((j) => j._id !== job._id);
      } else {
        updated = [...stored, job];
      }
      localStorage.setItem('jobconnect_saved_jobs', JSON.stringify(updated));
      setSavedIds(updated.map((j) => j._id));
    } catch (err) {
      console.error(err);
    }
  };

  const jobTypes = [
    { label: 'All Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'Internship' },
  ];

  const fetchJobs = async (overrides = {}) => {
    try {
      setLoading(true);
      setError('');

      const targetPage = overrides.page !== undefined ? overrides.page : page;
      const targetQuery = overrides.search !== undefined ? overrides.search : searchQuery;
      const targetLocation = overrides.location !== undefined ? overrides.location : locationQuery;
      const targetJobType = overrides.jobType !== undefined ? overrides.jobType : selectedJobType;
      const targetSort = overrides.sort !== undefined ? overrides.sort : selectedSort;

      const params = {
        page: targetPage,
        limit: 9,
        sort: targetSort,
      };

      if (targetQuery.trim()) params.q = targetQuery.trim();
      if (targetLocation.trim()) params.location = targetLocation.trim();
      if (targetJobType) params.jobType = targetJobType;

      const response = await api.get('/jobs', { params });
      const data = response?.data || response;

      setJobs(data?.jobs || []);
      setTotalPages(data?.totalPages || 1);
      setTotalJobs(data?.totalJobs || 0);
    } catch (err) {
      setError(err?.message || 'Failed to fetch job listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, selectedJobType, selectedSort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedJobType('');
    setSelectedSort('-createdAt');
    setPage(1);
    fetchJobs({
      search: '',
      location: '',
      jobType: '',
      sort: '-createdAt',
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    fetchJobs({ search: '', page: 1 });
  };

  const handleClearLocation = () => {
    setLocationQuery('');
    setPage(1);
    fetchJobs({ location: '', page: 1 });
  };

  const handleClearJobType = () => {
    setSelectedJobType('');
    setPage(1);
    fetchJobs({ jobType: '', page: 1 });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero & Search Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20">
              🚀 Explore 100+ Live Openings
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Find Your Next <span className="text-indigo-400">Career Milestone</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Discover opportunities from early-stage startups to top tech enterprises.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 text-slate-800">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, keywords, or company..."
                    className="w-full text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-slate-200"></div>
                <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="City, state, or 'Remote'..."
                    className="w-full text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Filters and Jobs Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  Filter Jobs
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Employment Type
                </label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-indigo-600"
                    >
                      <input
                        type="radio"
                        name="jobType"
                        checked={selectedJobType === type.value}
                        onChange={() => {
                          setSelectedJobType(type.value);
                          setPage(1);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Sort Postings By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="-salary">Salary: High to Low</option>
                  <option value="salary">Salary: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{totalJobs}</span> available
                positions
              </p>
              {(searchQuery.trim() || locationQuery.trim() || selectedJobType) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Active Filter Chips Bar */}
            {(searchQuery.trim() || locationQuery.trim() || selectedJobType) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  Active Filters:
                </span>

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                    Keyword: "{searchQuery.trim()}"
                    <button
                      onClick={handleClearSearch}
                      className="hover:text-indigo-900 ml-0.5"
                      title="Clear keyword"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {locationQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                    Location: "{locationQuery.trim()}"
                    <button
                      onClick={handleClearLocation}
                      className="hover:text-indigo-900 ml-0.5"
                      title="Clear location"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {selectedJobType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                    Type: {selectedJobType}
                    <button
                      onClick={handleClearJobType}
                      className="hover:text-indigo-900 ml-0.5"
                      title="Clear job type"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-rose-600 hover:bg-rose-50 font-semibold transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4"
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-16 bg-slate-50 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-rose-600 text-sm font-semibold">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">No Jobs Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  We couldn't find any positions matching your search criteria. Try modifying your
                  filters or keywords.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                          {job.company?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {job.jobType || 'Full-time'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleSaveJob(e, job)}
                            title={savedIds.includes(job._id) ? 'Remove bookmark' : 'Save job'}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Bookmark
                              className={`w-4 h-4 ${
                                savedIds.includes(job._id)
                                  ? 'fill-indigo-600 text-indigo-600'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
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

                      <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="w-full py-2.5 px-4 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        View & Apply
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
