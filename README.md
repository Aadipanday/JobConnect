# 💼 JobConnect - Full-Stack Job Recruitment Platform

**JobConnect** is a comprehensive, production-ready recruitment and job portal platform connecting Candidates, Recruiters, and Administrators.

---

## 🏗 Project Architecture

```
JobConnect/
└── jobConnect-Backend/     # Node.js + Express 5 + MongoDB Production REST API (MVC Architecture)
```

---

## 🚀 Quick Start Guide

### 1. Setup Backend
```bash
cd jobConnect-Backend
npm install
npm run dev
```
The backend starts on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

---

## 👥 Platform Roles & Workflows

1. **Candidate (Job Seeker)**
   - Browse and search jobs by keyword, company, and location.
   - Apply with cover letter and resume link.
   - Duplicate application prevention.
   - Track application progress (`Applied`, `Interview`, `Hired`, `Rejected`) in Candidate Dashboard.
   - View scheduled interviews.

2. **Recruiter (Employer / Hiring Manager)**
   - Post new jobs with role requirements, salary, and job type.
   - View applicants per job posting.
   - Bulk update applicant statuses.
   - Add internal notes and schedule interviews with candidate notification.
   - Export applicant rosters to CSV or Excel (`.xlsx`).

3. **Admin (Platform Superuser)**
   - User directory management (promote/demote roles between candidate, recruiter, and admin).
   - Moderate and delete spam job postings.
   - Ban rogue or fraudulent recruiters.
   - Platform analytics & growth trends (monthly job creation & weekly application submissions).

---

## 📖 Detailed Documentation

- [Backend Documentation & API Reference](./jobConnect-Backend/README.md)
