

```markdown
# Dmless – Recruitment Pre-Screening Platform

## 🚀 Overview

Dmless is a SaaS recruitment pre-screening platform that helps recruiters filter unqualified candidates automatically before reviewing resumes. It introduces a knockout MCQ-based hiring link that ensures only qualified candidates move forward.

Live App: https://dm-less-s7hb.vercel.app/

---

## 🎯 Problem Statement

Recruiters receive high volumes of applications from platforms like LinkedIn and Instagram. Manual resume screening is time-consuming and inefficient.

Dmless solves this by:
- Adding an automated screening layer
- Eliminating unqualified candidates instantly
- Allowing only shortlisted candidates to upload resumes
- Providing analytics inside a recruiter dashboard

---

## ✨ Features

### Recruiter
- Secure authentication (Supabase Auth)
- Create job roles with description
- Add exactly 5 MCQs with correct answers
- Generate public hiring link
- Dashboard analytics:
  - Total Applicants
  - Knocked Out
  - Shortlisted
- View candidate list
- Download resumes

### Candidate
- Access public job link
- Enter name and email
- Attempt 5 MCQs
- Auto disqualification on wrong answer
- Resume upload (PDF only, max 5MB) if passed

---

## 🛠 Tech Stack

### Frontend
- React (JavaScript)
- CSS
- Axios / Fetch API

### Backend (Supabase)
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

### Deployment
- Vercel (Frontend)
- Supabase Hosted Backend

---

## 🏗 Architecture Overview

```

React Frontend (Vercel)
↓
Supabase API Layer
↓
PostgreSQL Database
↓
Supabase Storage (Resume PDFs)

````

---

## 🗄 Database Schema (Summary)

### recruiters
- id (uuid)
- name
- email
- created_at

### jobs
- id (uuid)
- recruiter_id (fk)
- title
- description
- created_at

### questions
- id (uuid)
- job_id (fk)
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_option

### candidates
- id (uuid)
- job_id (fk)
- name
- email
- status (KNOCKED_OUT / SHORTLISTED)
- score
- resume_url
- created_at

---

## 🔐 Security

- Supabase Auth for recruiters
- Row Level Security (RLS) enabled
- Recruiters can only access their own jobs
- PDF-only resume upload
- File size limited to 5MB
- Duplicate email prevention per job

---

## ⚙️ Local Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/dmless.git
cd dmless
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Environment Variables

Create `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

---

## 🧩 Supabase Configuration

1. Create a new Supabase project
2. Create database tables (see schema above)
3. Enable Row Level Security
4. Create policies:

   * Recruiters can access only their jobs
   * Recruiters can view only their candidates
5. Create Storage bucket for resumes
6. Set file type restrictions (PDF only)

---

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

Backend is managed directly via Supabase cloud.

---

## 📁 Folder Structure

```
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── hooks/
 ├── utils/
 ├── App.js
 └── main.js
```

---

## 🔮 Future Improvements

* AI resume scoring
* Email notifications
* CSV export of shortlisted candidates
* Interview scheduling integration
* Anti-cheat timer system
* Candidate analytics dashboard


