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

### Hybrid Build Strategy
- **Frontend**: Pre-built static files from production (Cloudways) served from `server/public/`
- **Backend**: `dist/server-original.cjs` (production compiled binary) loaded by `dist/index.cjs` wrapper
- **Wrapper (`dist/index.cjs`)**: Adds static file serving + SPA fallback + trust proxy + cache headers
- **Source code** (`server/`, `src/`, `shared/`): Full source for future builds via `npx tsx script/build.ts`

### Startup
- `bash start.sh` → `node dist/index.cjs` on port 5000
- Static files: `server/public/` (146 code-split JS/CSS files + PDFs)
- Database: `sqlite.db` (SQLite via LibSQL)

### Tech Stack
**Frontend**: React 18, TypeScript, Wouter routing, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion
**Backend**: Express.js, SQLite/LibSQL, Drizzle ORM, Passport.js (Google OAuth + local), Gemini AI, Nodemailer

### Project Structure
```
├── start.sh                 # Startup script
├── src/                     # Frontend source
│   ├── App.tsx              # Main app with routing
│   ├── pages/               # Page components
│   ├── components/          # UI components (home, layout, lessons, ui)
│   ├── hooks/               # Custom hooks (auth, mobile, progress)
│   └── lib/                 # Utilities (queryClient, seo, theme)
├── server/                  # Backend source
│   ├── index.ts             # Express entry (CORS, security headers, trust proxy)
│   ├── routes.ts            # API routes (auth, chat, progress, SEO)
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer
│   ├── static.ts            # Static file serving with caching
│   ├── lib/gemini.ts        # Shared Gemini AI client
│   ├── lib/sendMail.ts      # Email utility
│   ├── auth/                # Authentication (Passport, sessions, OAuth)
│   ├── admin/               # Admin CMS (routes, storage, hierarchy)
│   ├── routes/              # Additional routes (pdf-extractor, extract-questions)
│   └── middleware/           # Auth middleware
├── shared/                  # Shared types and schemas
│   ├── schema.ts            # Drizzle database schema
│   └── routes.ts            # API route definitions
├── dist/                    # Build output
│   ├── index.cjs            # Wrapper (static serving + loads server-original)
│   └── server-original.cjs  # Production server binary from Cloudways
├── server/public/           # Production frontend + attached assets (PDFs)
├── script/build.ts          # Build script (Vite + esbuild)
└── sqlite.db                # SQLite database
```

### Environment Variables
**Secrets**: SESSION_SECRET, GEMINI_API_KEY, YOUTUBE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, SMTP_PASS, SSH_PASS
**Config**: NODE_ENV=production, PORT=5000

### Security Features
- CORS: Strict origin whitelist (sharfedu.com + Replit domain only)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, HSTS
- Path traversal protection on file serving routes
- Session: httpOnly, sameSite=lax, secure in production
- Passwords: bcrypt hashed
- File uploads: Size limited (20MB), random filenames, MIME type whitelist (PDF, PNG, JPEG, WebP, GIF, SVG)
- Error messages: Generic in production (no stack trace leaks)

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

### Production Server (Cloudways)
- Host: 165.227.236.121, User: SSH_USER env var
- App path: /home/master/applications/cmkdrtgqcv/public_html/
- Node app: /home/master/applications/cmkdrtgqcv/public_html/node_app/
- Frontend: tar + scp to ~/  then extract in public_html/
- Backend: tar + scp index.cjs + server-original.cjs to node_app/

### GitHub
- Repo: https://github.com/dream4arb/sharfedu.com
- Push: `git push "https://${GITHUB_TOKEN}@github.com/dream4arb/sharfedu.com.git" HEAD:main`
