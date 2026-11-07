# 📄 ReviewCV AI - AI Resume Analyzer & ATS Optimizer

[![Tech: MERN Stack](https://img.shields.io/badge/stack-MERN-blueviolet)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59)](https://expressjs.com/)

ReviewCV AI is an intelligent, full-stack AI-powered resume review system that calculates ATS scores, identifies missing sections & buzzwords, suggests improvements, matches resumes against job descriptions, and offers AI bullet-point rewrites.

---

## 📁 Project Structure

```
Resumind-AI-main/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── app/                # Redux Toolkit store, slices, and API services
│   │   ├── components/         # UI components (Radix UI, Tailwind)
│   │   ├── pages/              # Dashboard, Analysis, Job Match, Admin, Auth
│   │   └── types/              # TypeScript definitions
│   ├── .env                    # Frontend environment configuration
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection
│   │   ├── controllers/        # Auth, Resume, Job Match, Admin controllers
│   │   ├── middlewares/        # JWT auth, Multer upload, logging
│   │   ├── models/             # Mongoose schemas (User, Report, OTP, etc.)
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # OpenRouter AI client, PDF parsing, Resend email
│   │   └── server.js           # Server entry point
│   ├── uploads/                # Temporary local upload staging directory
│   ├── .env                    # Backend environment configuration
│   └── package.json
│
├── package.json                # Root scripts to run and install both ends
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### 1. Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install:all
```
*Or manually:*
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

#### Backend (`server/.env`):
A starter `server/.env` file is included. Update the following keys:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/resumind-ai  # Or MongoDB Atlas connection string
JWT_SECRET=your-secret-jwt-key
SESSION_SECRET=your-secret-session-key
CLIENT_URL=http://localhost:5173

# Required for file uploads (https://cloudinary.com)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Required for AI analysis (https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.0-flash-001:free

# Email service (https://resend.com)
# In development mode, leaving this empty logs OTP directly to the terminal!
RESEND_API_KEY=
EMAIL_FROM=Resumind AI <onboarding@resend.dev>
```

#### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run Development Servers

**Run Server:**
```bash
npm run server
# Server runs at http://localhost:5000
```

**Run Client:**
```bash
npm run client
# Client runs at http://localhost:5173
```

---

## 🚢 Deployment Guide

### Deploying the Backend (Render / Railway)

1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to:
   ```bash
   npm install
   ```
5. Set the **Start Command** to:
   ```bash
   npm start
   ```
6. Add all environment variables from `server/.env`:
   - `MONGO_URI` (from MongoDB Atlas)
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
   - `OPENROUTER_API_KEY`
   - `RESEND_API_KEY`
   - `CLIENT_URL` (set to your Vercel frontend URL, e.g. `https://your-app.vercel.app`)

---

### Deploying the Frontend (Vercel)

1. In [Vercel](https://vercel.com), create a new project and import the repository.
2. Set the **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-app.onrender.com/api` (URL of your deployed backend)
5. Click **Deploy**.

---

## ✨ Key Features & Enhancements

- **Resume ATS Analysis**: Deep ATS scoring, buzzword detection, tone evaluation, and missing section identification.
- **AI Bullet Point Rewrite**: Suggests action-oriented, quantifiable replacements for bullet points.
- **Job Matching**: Compares resume text directly with job descriptions for skill coverage and gap analysis.
- **Secure Authentication**: OTP verification with email fallback (logs to console in dev mode), JWT tokens, and role-based access.
- **Admin Dashboard**: Analytics, user management, and report administration.
