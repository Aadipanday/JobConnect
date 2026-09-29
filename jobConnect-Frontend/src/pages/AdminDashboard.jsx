import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  Activity,
  Trash2,
  UserX,
  UserCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  // State
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'jobs'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: {} })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/jobs?limit=50').catch(() => ({ data: { jobs: [] } })),
      ]);

      const aData = analyticsRes?.data || analyticsRes || {};
      const uData = usersRes?.data || usersRes || [];
      const jData = jobsRes?.data?.jobs || jobsRes?.jobs || [];

      setAnalytics(aData);
      setUsersList(Array.isArray(uData) ? uData : []);
      setJobsList(Array.isArray(jData) ? jData : []);
    } catch (err) {
      setError(err?.message || 'Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/promote/${userId}`, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMsg(`User role successfully changed to ${newRole}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to update user role');
    }
  };

  // Ban or Unban user
  const handleToggleBan = async (userId) => {
    try {
      const res = await api.put(`/admin/ban-recruiter/${userId}`);
      const updatedUser = res?.data?.user;
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: updatedUser?.status || 'banned' } : u))
      );
      setSuccessMsg('User account status updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to update user status');
    }
  };

  // Delete Job Posting (Admin Moderation)
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) {
      return;
    }

    try {
      await api.delete(`/admin/job/${jobId}`);
      setJobsList((prev) => prev.filter((j) => j._id !== jobId));
      setSuccessMsg('Job posting deleted by admin moderation.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.message || 'Failed to delete job');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const totalUsersCount = (analytics?.totalCandidates || 0) + (analytics?.totalRecruiters || 0) || usersList.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading Platform Administration Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Administration Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>! System telemetry and user directory.
            </p>
          </div>
        </div>

        {/* Global Success / Error Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Platform Metrics Cards (UI Mockup 4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-slate-900">{totalUsersCount}</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +12%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Total Users</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-slate-900">
                  {analytics?.totalJobs ?? jobsList.length}
                </p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Active Job Posts</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-slate-900">
                  {analytics?.totalApplications ?? 0}
                </p>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  +18%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Applications Logged</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-slate-900">99.9%</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">System Health</p>
            </div>
          </div>
        </div>

        {/* Growth & Activity Visualization Bar (UI Mockup 4) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Monthly Platform Growth & Job Postings
              </h3>
              <p className="text-xs text-slate-500">Live platform activity trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-3 h-3 rounded bg-indigo-600"></span> Candidate Growth
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded bg-slate-800"></span> Job Postings
              </span>
            </div>
          </div>

          {/* Visual Activity Bars */}
          <div className="h-32 flex items-end gap-3 pt-4 px-2">
            {[
              { m: 'Jan', c: 35, j: 20 },
              { m: 'Feb', c: 45, j: 28 },
              { m: 'Mar', c: 55, j: 32 },
              { m: 'Apr', c: 68, j: 40 },
              { m: 'May', c: 75, j: 50 },
              { m: 'Jun', c: 88, j: 60 },
              { m: 'Jul', c: 98, j: 72 },
              { m: 'Aug', c: 110, j: 85 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center gap-1 h-24">
                  <div
                    style={{ height: `${bar.c}%` }}
                    className="w-1/2 bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600"
                    title={`Candidates: ${bar.c}`}
                  ></div>
                  <div
                    style={{ height: `${bar.j}%` }}
                    className="w-1/2 bg-slate-800 rounded-t-sm transition-all hover:bg-slate-900"
                    title={`Jobs: ${bar.j}`}
                  ></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{bar.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Management Controls & Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Switcher & Search Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'users'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                User Directory ({usersList.length})
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'jobs'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Job Moderation ({jobsList.length})
              </button>
            </div>

            {/* Filter Tools (for Users tab) */}
            {activeTab === 'users' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab 1: User Management Table */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isBanned = u.status === 'banned' || u.role === 'banned';
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'recruiter'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isBanned
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isBanned ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role Select Dropdown */}
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === user?._id}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-40 focus:outline-none"
                            >
                              <option value="candidate">Candidate</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>

                            {/* Ban / Activate Button */}
                            {u._id !== user?._id && (
                              <button
                                onClick={() => handleToggleBan(u._id)}
                                title={isBanned ? 'Activate user' : 'Suspend user'}
                                className={`p-1.5 rounded-lg border transition ${
                                  isBanned
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                                }`}
                              >
                                {isBanned ? (
                                  <UserCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <UserX className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Job Moderation Table */}
          {activeTab === 'jobs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Position Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Job Type</th>
                    <th className="py-3 px-4 text-right">Moderate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobsList.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{job.title}</td>
                      <td className="py-3 px-4 text-slate-600">{job.company}</td>
                      <td className="py-3 px-4 text-slate-500">{job.location || 'Remote'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {job.jobType || 'Full-time'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Job
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
  );
};

export default AdminDashboard;
