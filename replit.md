# Sharaf Educational Platform (شارف التعليمية)

## Overview

Sharaf (شارف) is a comprehensive Arabic educational platform designed for all Saudi students from elementary through high school and beyond. The platform covers all educational stages including Elementary (الابتدائية), Middle School (المتوسطة), High School (الثانوية), Academic Paths (المسارات), and Aptitude Tests (القدرات والتحصيلي). It provides interactive courses, video lessons, quizzes, and progress tracking with a modern design featuring stage-specific color themes.

## User Preferences

- Preferred communication style: Simple, everyday language
- Design inspiration: Shahbandr.com / Dave.com aesthetic
- Color palette: Stage-specific colors (sky blue for elementary, emerald for middle, violet for high, amber for paths, rose for qudurat)
- Typography: Tajawal font for Arabic text
- Layout: RTL (Right-to-Left) with full Arabic support

## System Architecture

### Build & Deployment Strategy

This project runs a **hybrid approach**:
- **Backend (dist/index.cjs)**: Built from source code in `server/` using `npx tsx script/build.ts`
- **Frontend (server/public/)**: Uses pre-built static files from the production server (sharfedu.com) — NOT built from source on Replit
- **Wrapper (dist/index.cjs)**: A wrapper script loads the server's original `dist/server-original.cjs` and adds static file serving + proxy routes for Replit compatibility

**Why this approach?** The production server (Cloudways) has a more recent compiled build that includes features not yet in the source code (e.g., YouTube video info API, tab-types API). The source code in `git_repo` on the server is behind the compiled build.

### Build Commands
- **Full rebuild (backend only)**: `npx tsx script/build.ts` then restore server/public from production
- **Database**: Synced from production server SQLite
- **Static assets proxy**: Files in `/attached_assets/` are fetched from sharfedu.com on-demand and cached locally

### Startup (Production)
- **Entry point**: `bash start.sh` → sets DATABASE_URL, NODE_ENV=production → runs `node dist/index.cjs`
- **Port**: 5000
- **Static files**: Served from `server/public/` via wrapper
- **dist/index.cjs**: Wrapper that loads `dist/server-original.cjs` + adds express.static + proxy
- **dist/server-original.cjs**: The actual server from Cloudways production build

### SSH Access to Production Server
- **Host**: 165.227.236.121 (Cloudways/DigitalOcean)
- **User**: Stored in env var SSH_USER
- **Password**: Stored in secret SSH_PASS
- **Port**: 22
- **App path**: /home/master/applications/cmkdrtgqcv/
  - Source: `git_repo/src/`, `git_repo/server/`, `git_repo/shared/`
  - Production build: `public_html/` (static) + `public_html/node_app/index.cjs` (server)
  - Database: `public_html/node_app/sqlite.db`

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v3 with shadcn/ui components
- **Animations**: Framer Motion
- **Path aliases**: `@/` → `src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend
- **Framework**: Express.js
- **Database**: SQLite via LibSQL (`file:sqlite.db`)
- **Authentication**: Google OAuth + local auth (bcrypt) via Passport.js
- **Session Storage**: Custom SQLite session store (`server/auth/sessionStore.ts`)
- **AI**: Google Gemini API for chat/tutoring
- **Email**: Nodemailer with SMTP
- **Trust Proxy**: Enabled (`app.set("trust proxy", 1)`) for Replit reverse proxy

### Project Structure
```
├── start.sh              # Startup script (sets env, runs server)
├── index.html            # Vite entry point (dev mode)
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── src/                  # Frontend source code
│   ├── App.tsx           # Main app with routing
│   ├── pages/            # Page components (Lesson.tsx, Home.tsx, etc.)
│   ├── components/       # UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   └── data/             # Static data files
├── server/               # Backend source code
│   ├── index.ts          # Express server entry (trust proxy enabled)
│   ├── routes.ts         # Main API routes (includes attached_assets proxy)
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   ├── static.ts         # Static file serving
│   ├── auth/             # Authentication
│   ├── admin/            # Admin CMS routes
│   └── ...
├── shared/               # Shared between client & server
├── script/               # Build scripts
├── dist/                 # Build output
│   ├── index.cjs         # Wrapper (loads server-original + static serving)
│   └── server-original.cjs  # Production server from Cloudways
├── server/public/        # Production frontend build from Cloudways
│   ├── index.html        # Built HTML
│   ├── assets/           # Built JS/CSS (146 files, code-split)
│   ├── attached_assets/  # Cached PDF files
│   └── pdf.worker.min.mjs
└── sqlite.db             # SQLite database (synced from production)
```

### Environment Variables (Secrets - all configured)
- `SESSION_SECRET` - Session encryption key
- `GEMINI_API_KEY` - Google Gemini AI API key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `SMTP_PASS` - SMTP email password
- `SSH_PASS` - SSH password for production server access

### Environment Variables (Config)
- `NODE_ENV` - production
- `PORT` - 5000
- `SSH_HOST` - 165.227.236.121
- `SSH_USER` - master_nyrmduupwf
- `SSH_PORT` - 22

## Key Pages

1. **Home (/)**: Landing page with Hero, SearchBar, StageSelector, Features, Stats, CTA
2. **Stage (/stage/:stageId)**: Stage-specific page with grades and subjects
3. **Subject (/subject/:stageSlug/:gradeSlug/:subjectSlug)**: Subject lessons list
4. **Dashboard (/dashboard)**: Student dashboard with progress tracking (protected)
5. **Lesson (/lesson/:stage/:subject/:lessonId)**: Lesson with tabs (الدرس, الفيديو, شارف AI, الملخص)
6. **Profile (/profile)**: User profile (protected)
7. **Admin (/admin)**: Admin CMS dashboard (protected, admin only)
8. **Auth**: /login, /register, /forgot-password, /reset-password

## Lesson Page Tabs
- **الدرس**: PDF lesson content (from CMS or static data)
- **الفيديو**: YouTube videos with metadata
- **شارف AI**: AI-powered tutoring
- **الملخص**: PDF summary

## Syncing with Production
To re-sync from production server:
1. SSH to get latest database: `sshpass -p "$SSH_PASS" ssh ... "cat sqlite.db" > sqlite.db`
2. Get latest static build: `tar` from `public_html/` → `server/public/`
3. Get latest server build: `cat index.cjs` from `public_html/node_app/` → `dist/server-original.cjs`
