import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, Code, Share2 } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="group inline-block">
              <Logo size="default" isDark={true} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern recruitment infrastructure connecting world-class talent with high-growth teams and enterprises.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition"
                title="Code Repository"
              >
                <Code className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition"
                title="Platform Updates"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://jobconnect.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition"
                title="Global Network"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition">
                  Browse Open Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidate/dashboard" className="hover:text-white transition">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link to="/candidate/applications" className="hover:text-white transition">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/jobs?jobType=Remote" className="hover:text-white transition">
                  Remote Tech Positions
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/recruiter/post-job" className="hover:text-white transition">
                  Post a Job Opening
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-white transition">
                  Recruiter CRM Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Hiring Solutions
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Applicant Tracking System</span>
              </li>
            </ul>
          </div>

          {/* Security & Platform Status */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Trust
            </h4>
            <div className="space-y-3 text-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Systems Operational</span>
              </div>
              <p className="text-slate-400 text-xs">
                Encrypted with 256-bit TLS HTTPS and secure HTTP-only dual token rotation.
              </p>
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Recruitment Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobConnect Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
