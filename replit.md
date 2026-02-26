# Sharaf Educational Platform (شارف التعليمية)

## Overview

Sharaf (شارف) is a comprehensive Arabic K-12 educational platform for Saudi students. Covers Elementary (الابتدائية), Middle School (المتوسطة), High School (الثانوية), Academic Paths (المسارات), and Aptitude Tests (القدرات والتحصيلي). Features interactive lessons, YouTube videos, AI tutoring (Gemini), progress tracking, and a CMS admin panel.

## User Preferences

- Communication: Simple, everyday language
- Color palette: Stage-specific (sky blue elementary, emerald middle, violet high, amber paths, rose qudurat)
- Typography: Tajawal font for Arabic
- Layout: RTL (Right-to-Left)
- Design: Do NOT change layout/design, only code files

## Architecture

### Build & Run
- **Build**: `npx tsx script/build.ts` → produces `dist/index.cjs` (minified server bundle) + `server/public/` (Vite-built frontend)
- **Post-build**: PDF worker (`pdf.worker.min.mjs`) is auto-copied to `server/public/` by the build script
- **Start**: `bash start.sh` → `NODE_ENV=production node dist/index.cjs` on port 5000
- **Database**: `sqlite.db` (SQLite via LibSQL/Drizzle ORM)

### Tech Stack
**Frontend**: React 18, TypeScript, Wouter routing, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion
**Backend**: Express.js, SQLite/LibSQL, Drizzle ORM, Passport.js (Google OAuth + local), Gemini AI, Nodemailer

### Project Structure
```
├── start.sh                 # Startup script (sets NODE_ENV, PORT, runs dist/index.cjs)
├── script/build.ts          # Build script (Vite frontend + esbuild backend)
├── src/                     # Frontend source
│   ├── App.tsx              # Main app with routing
│   ├── pages/               # Page components (Home, Lesson, Stage, Dashboard, Admin, Auth)
│   ├── components/          # UI components (home, layout, lessons, ui)
│   ├── hooks/               # Custom hooks (auth, mobile, progress)
│   └── lib/                 # Utilities (queryClient, seo, theme)
├── server/                  # Backend source
│   ├── index.ts             # Express entry (CORS, security headers, trust proxy)
│   ├── routes.ts            # API routes (AI summarize, YouTube info, progress, SEO, attached_assets)
│   ├── static.ts            # Static file serving with 1y cache + SPA fallback
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer
│   ├── lib/gemini.ts        # Shared Gemini AI client (singleton)
│   ├── lib/sendMail.ts      # Email utility (Nodemailer)
│   ├── auth/                # Authentication (Passport, sessions, Google OAuth)
│   ├── admin/               # Admin CMS (adminRoutes, cmsRoutes, cmsStorage, contentRoutes, hierarchyStore)
│   ├── routes/              # AI routes (pdf-extractor, extract-questions)
│   ├── data/                # cms-hierarchy (curriculum structure)
│   └── middleware/          # Auth middleware (adminAuth)
├── shared/                  # Shared types and schemas
│   ├── schema.ts            # Drizzle database schema
│   └── routes.ts            # API route definitions
├── dist/index.cjs           # Production server bundle (esbuild output)
├── server/public/           # Production frontend (Vite output) + PDF worker
├── attached_assets/         # User-uploaded files (uploads/, lessons/)
└── sqlite.db                # SQLite database
```

### Environment Variables
**Secrets**: SESSION_SECRET, GEMINI_API_KEY, YOUTUBE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, SMTP_PASS, SSH_PASS, GITHUB_TOKEN
**Config**: NODE_ENV=production, PORT=5000, DATABASE_URL=file:sqlite.db

### YouTube Video Metadata
- **Strategy**: Two-tier server-side approach (no client-side API loading for performance)
  1. **YouTube Data API** (server-side) — full metadata when quota available
  2. **YouTube oEmbed API** (server-side fallback) — title + channel, no API key needed
- **Cache**: Server-side with TTL (1h) and max size (500 entries)
- **Endpoint**: `GET /api/content/youtube-video-info?ids=id1,id2` — max 20 IDs per request

### Security Features
- CORS: Strict origin whitelist (sharfedu.com + Replit domain; localhost only in dev)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, HSTS (production)
- Path traversal protection on file serving routes (SAFE_NAME regex + path.basename)
- Session: httpOnly, sameSite=lax, secure in production
- Passwords: bcrypt hashed
- File uploads: Size limited (20MB), random filenames, MIME type whitelist + magic number validation (PDF, PNG, JPEG, WebP, GIF, SVG)
- Error messages: Generic in production (no stack trace leaks)
- All file I/O uses async fs/promises (non-blocking)

### Key Pages
1. **Home (/)**: Landing with Hero, SearchBar, StageSelector, Features
2. **Stage (/stage/:stageId)**: Grades and subjects per stage
3. **Lesson (/lesson/:stage/:subject/:lessonId)**: Tabs: الدرس، الفيديو، شارف AI، الملخص
4. **Dashboard (/dashboard)**: Student progress (protected)
5. **Admin (/admin)**: CMS dashboard (admin only)
6. **Auth**: /login, /register, /forgot-password, /reset-password

### Deployment Rule (STRICT)
**Every change must be deployed in this exact order:**
1. First: Push to GitHub (`git push` using GITHUB_TOKEN)
2. Second: Upload to production server via SSH
Never skip either step. Never deploy to server without pushing to GitHub first.

### Production Server
- Host: 165.227.236.121, User: SSH_USER env var
- App path: /home/master/applications/cmkdrtgqcv/public_html/
- Node app: node_app/index.cjs
- Deploy frontend: `tar czf /tmp/file.tar.gz -C server/public --exclude='attached_assets' .` → scp → extract
- Deploy backend: scp dist/index.cjs → node_app/

### GitHub
- Repo: https://github.com/dream4arb/sharfedu.com
- Push: `git push "https://${GITHUB_TOKEN}@github.com/dream4arb/sharfedu.com.git" HEAD:main`
