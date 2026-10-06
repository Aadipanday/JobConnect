import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, ArrowLeft, Briefcase, LayoutDashboard } from 'lucide-react';

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'recruiter') return '/recruiter/dashboard';
    if (user?.role === 'admin') return '/admin';
    return '/candidate/dashboard';
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        {/* Visual Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            404 Error • Lost Route
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition"
          >
            <Briefcase className="w-4 h-4" />
            Explore Job Board
          </Link>

          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              My Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
