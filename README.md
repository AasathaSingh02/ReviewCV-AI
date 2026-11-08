# 📄 ReviewCV AI - AI Resume Analyzer & ATS Optimizer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://reviewcv-ai.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend%20API-Render-informational?style=for-the-badge&logo=render)](https://reviewcv-ai.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blueviolet?style=for-the-badge)](#tech-stack)

**ReviewCV AI** is an intelligent, full-stack AI-powered resume review system that calculates ATS scores, identifies missing sections & buzzwords, extracts strong action verbs, suggests actionable improvements, previews resumes in real-time, and offers AI bullet-point rewrites.

---

## 🌐 Live Production URLs

| Component | Platform | Live URL |
|---|---|---|
| **Frontend Web App** | Vercel | [https://reviewcv-ai.vercel.app](https://reviewcv-ai.vercel.app) |
| **Backend REST API** | Render | [https://reviewcv-ai.onrender.com](https://reviewcv-ai.onrender.com) |
| **API Health Check** | Render | [https://reviewcv-ai.onrender.com/healthcheck](https://reviewcv-ai.onrender.com/healthcheck) |

---

## 📸 Application Preview & How It Works

### 1. Modern Landing Page
Fast, responsive, modern interface built with React, Vite, Tailwind CSS, and Framer Motion.
![Landing Page](docs/screenshots/01-landing-page.jpg)

---

### 2. Direct Resume Upload (Guest & Authenticated Mode)
Users can drag & drop any PDF resume directly without mandatory login friction, or create an account with OTP email verification.
![Direct Resume Upload](docs/screenshots/02-direct-upload.png)

---

### 3. Instant ATS Compatibility Score & Section Audit
Evaluates resumes on structure, keyword density, section completeness (Summary, Experience, Projects, Skills, Education, Certifications, Awards), and generates actionable tips.
![ATS Score & Cards](docs/screenshots/03-ats-score-analysis.jpg)

---

### 4. In-App Resume Preview & Instant PDF Download
Seamless PDF preview embedded in the browser with one-click direct PDF download and "Open in New Tab" capabilities.
![Resume Preview & Download](docs/screenshots/04-resume-preview.png)

---

### 5. Cloud-Connected Backend & Live MongoDB Atlas
Node.js + Express backend running live on Render, connected to cloud MongoDB Atlas with graceful failover and automated multi-tier PDF parsing.
![Render Backend Live Logs](docs/screenshots/05-backend-render-live.jpg)

---

## 🌟 Key Features

* **Instant ATS Compatibility Scoring (50–94 realistic scale):** Evaluates section balance, metrics, keywords, and length.
* **Smart Heuristic & OpenRouter LLM Analysis:** Dual-mode AI analysis — works out of the box with built-in heuristic analysis or cloud LLM (Gemini 2.0 Flash / DeepSeek) via OpenRouter.
* **Interactive PDF Preview & Download:** Embedded HTML5 preview with direct binary blob download.
* **Bullet Point AI Rewriting:** Automatically rewrites passive bullet points using active, high-impact verbs.
* **OTP Email Verification & Guest Flow:** Secure signup with verification codes via Resend API and guest bypass mode.
* **Production Deployed:** Deployed across Vercel (Frontend), Render (Backend), and MongoDB Atlas (Cloud Database).

---

## 🛠️ Tech Stack

### Frontend:
* **React 18** with **TypeScript** & **Vite**
* **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
* **Redux Toolkit** for state management
* **Framer Motion** for smooth animations
* **Lucide Icons** & **Sonner** notifications

### Backend:
* **Node.js** & **Express 5**
* **MongoDB Atlas** with **Mongoose**
* **PDF-Parse & PDF2JSON** multi-tier text extraction
* **OpenRouter AI API** (Gemini 2.0 Flash / Llama 3)
* **Resend API** for email OTP verification
* **JWT & Cookie-Parser** for authentication

---

## 📁 Project Structure

```text
ReviewCV-AI/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── app/                # Redux Toolkit store, slices, and API services
│   │   ├── components/         # UI components & landing page sections
│   │   ├── pages/              # Dashboard, Analysis, Auth, Settings
│   │   └── types/              # TypeScript definitions
│   ├── vercel.json             # Vercel SPA rewrites configuration
│   ├── .env                    # Frontend environment variables
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection
│   │   ├── controllers/        # Auth, Resume, Job Match controllers
│   │   ├── middlewares/        # JWT auth, Multer PDF upload, error handler
│   │   ├── models/             # Mongoose schemas (User, Report, OTP)
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # Smart local analyzer, OpenRouter client, PDF extractor
│   │   └── server.js           # Express app entry point
│   ├── uploads/                # Temporary local upload staging directory
│   ├── .env                    # Backend environment variables
│   └── package.json
│
├── docs/screenshots/           # Readme application visual screenshots
├── package.json                # Root scripts
└── README.md                   # Project documentation
```

---

## ⚙️ Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/maheshsingh-74/ReviewCV-AI.git
cd ReviewCV-AI
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Variables

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/reviewcv-ai
JWT_SECRET=your-secret-jwt-key
SESSION_SECRET=your-secret-session-key
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Start Development Servers

In two separate terminals:

```bash
# Terminal 1 — Backend:
npm run server

# Terminal 2 — Frontend:
npm run client
```

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5000`

---

## 📜 License

MIT License © 2026 ReviewCV AI
